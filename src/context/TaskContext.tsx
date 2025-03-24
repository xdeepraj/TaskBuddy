import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { Dayjs } from "dayjs";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebaseConfig";
import {
  collection,
  addDoc,
  query,
  where,
  Timestamp,
  doc,
  updateDoc,
  deleteDoc,
  onSnapshot,
} from "firebase/firestore";

import { Task, TaskContextType } from "../types/types";

// TaskContext creation
const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const TaskProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const userId = user?.uid;

  // Store original tasks
  const [tasks, setTasks] = useState<Task[]>([]);
  // Store filtered tasks
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);

  const [currentTask, setCurrentTask] = useState<Task | null>(null);
  // Dialog state for TaskForm
  const [openForm, setOpenForm] = useState(false);

  // Filters
  const [filterCategory, setFilterCategory] = useState<string>("All");
  const [filterDate, setFilterDate] = useState<Dayjs | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState<string>("");

  const [isSearching, setIsSearching] = useState(false);

  // Fetch Tasks from Firestore when User Logs In & using Firestore Listener
  useEffect(() => {
    if (!userId) return;

    // Fetch all tasks for the logged-in user initially
    const tasksQuery = query(
      collection(db, "tasks"),
      where("userId", "==", userId)
    );

    // Real-time listener for all tasks
    const unsubscribe = onSnapshot(tasksQuery, (querySnapshot) => {
      const tasksData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Task[];

      setTasks(tasksData); // Store all tasks
    });

    return () => unsubscribe(); // Cleanup listener
  }, [userId]);

  // Custom debounce logic using setTimeout
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
      setIsSearching(searchQuery !== "");
    }, 500);

    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Effect to apply filters locally
  useEffect(() => {
    let filtered = tasks;

    // Apply category filter
    if (filterCategory !== "All") {
      filtered = filtered.filter((task) => task.category === filterCategory);
    }

    // Apply date filter for all tasks up to the selected date
    if (filterDate) {
      filtered = filtered.filter((task) => {
        const taskDueDate = task.dueDate ? task.dueDate.toDate() : null;
        return taskDueDate && taskDueDate <= filterDate.endOf("day").toDate();
      });
    }

    // Apply search filter
    if (debouncedSearchQuery) {
      filtered = filtered.filter((task) =>
        task.title.toLowerCase().includes(debouncedSearchQuery.toLowerCase())
      );
    }

    setFilteredTasks(filtered);
  }, [tasks, filterCategory, filterDate, debouncedSearchQuery]);

  // Add a Task to Firestore and State
  const addTask = async (task: Task): Promise<string | null> => {
    if (!userId) return null;

    // Close dialog after adding
    setOpenForm(false);

    // Convert Dayjs `dueDate` to Firestore Timestamp before storing
    const newTask = {
      ...task,
      userId: user.uid,
      dueDate: task.dueDate
        ? Timestamp.fromDate(task.dueDate.startOf("day").toDate())
        : null,
    };

    try {
      const docRef = await addDoc(collection(db, "tasks"), newTask);
      return docRef.id as string;
    } catch (error) {
      console.error("Error adding task:", error);
      return null;
    }
  };

  // Update an existing task
  const updateTask = async (updatedTask: Task) => {
    if (!updatedTask.id) return;

    // Close dialog after updating
    setOpenForm(false);

    try {
      const taskRef = doc(db, "tasks", updatedTask.id);
      await updateDoc(taskRef, {
        ...updatedTask,
        dueDate: updatedTask.dueDate
          ? Timestamp.fromDate(updatedTask.dueDate.toDate())
          : null,
      });
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  // Delete a task
  const deleteTask = async (taskId: string) => {
    if (!taskId) return;

    try {
      await deleteDoc(doc(db, "tasks", taskId));
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  // Update status of multiple tasks
  const updateMultipleTasksStatus = async (
    tasksToUpdate: Task[],
    newStatus: string
  ) => {
    if (tasksToUpdate.length === 0) return;

    try {
      // Run all updates in parallel
      const updatePromises = tasksToUpdate.map((task) => {
        if (!task.id) return null;

        const taskRef = doc(db, "tasks", task.id);
        return updateDoc(taskRef, { status: newStatus });
      });

      await Promise.all(updatePromises);
    } catch (error) {
      console.error("Error updating tasks status:", error);
    }
  };

  // Delete multiple tasks
  const deleteMultipleTasks = async (tasksToDelete: Task[]) => {
    if (tasksToDelete.length === 0) return;

    try {
      // Run all deletions in parallel
      const deletePromises = tasksToDelete.map((task) => {
        if (!task.id) return null;

        const taskRef = doc(db, "tasks", task.id);
        return deleteDoc(taskRef);
      });

      await Promise.all(deletePromises);
    } catch (error) {
      console.error("Error deleting tasks:", error);
    }
  };

  return (
    <TaskContext.Provider
      value={{
        tasks,
        filteredTasks,
        currentTask,
        setCurrentTask,
        openForm,
        setOpenForm,
        addTask,
        updateTask,
        deleteTask,
        filterCategory,
        setFilterCategory,
        filterDate,
        setFilterDate,
        searchQuery,
        setSearchQuery,
        updateMultipleTasksStatus,
        deleteMultipleTasks,
        isSearching,
        setIsSearching,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};

export const useTask = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error("useTask must be used within a TaskProvider");
  }
  return context;
};
