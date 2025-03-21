import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import dayjs, { Dayjs } from "dayjs";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebaseConfig";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  Timestamp,
} from "firebase/firestore";

// Task structure
interface Task {
  id?: string; // Firestore will assign this
  title: string;
  description: string;
  category: string;
  dueDate: Dayjs | null;
  status: string;
  attachment: File | null;
}

// shape of the context data that will be available globally
interface TaskContextType {
  tasks: Task[]; // Store multiple tasks
  addTask: (task: Task) => void; // Function to add new task
  currentTask: Task;
  updateTask: (updatedTask: Task) => void;
  clearTask: () => void;

  // Filters
  filterCategory: string;
  setFilterCategory: (category: string) => void;
  filterDate: Dayjs | null;
  setFilterDate: (date: Dayjs | null) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

// TaskContext creation
const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const TaskProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const userId = user?.uid;

  const [tasks, setTasks] = useState<Task[]>([]); // Store multiple tasks
  const [currentTask, setCurrentTask] = useState<Task>({
    title: "",
    description: "",
    category: "",
    dueDate: null,
    status: "",
    attachment: null,
  });

  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterDate, setFilterDate] = useState<Dayjs | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Fetch Tasks from Firestore when User Logs In
  useEffect(() => {
    if (!userId) return;
    const fetchTasks = async () => {
      try {
        const tasksQuery = query(
          collection(db, "tasks"),
          where("userId", "==", userId)
        );
        const querySnapshot = await getDocs(tasksQuery);
        const tasksData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Task[];
        setTasks(tasksData);
      } catch (error) {
        console.error("Error fetching tasks:", error);
      }
    };

    fetchTasks();
  }, [userId]);

  // Add a Task to Firestore and State
  const addTask = async (task: Task) => {
    if (!userId) return;

    // console.log("task in addTask");
    // console.log(task);

    // Convert Dayjs `dueDate` to Firestore Timestamp before storing
    const newTask = {
      ...task,
      userId: user.uid,
      dueDate: task.dueDate
        ? Timestamp.fromDate(task.dueDate.startOf("day").toDate())
        : null,
    };

    try {
      await addDoc(collection(db, "tasks"), newTask);
      // Convert Firestore Timestamp back to Dayjs when updating local state
      setTasks((prevTasks) => [
        ...prevTasks,
        {
          ...task,
          dueDate: task.dueDate ? dayjs(task.dueDate.startOf("day")) : null, // Convert Timestamp back to Dayjs
        },
      ]);
    } catch (error) {
      console.error("Error adding task:", error);
    }

    // try {
    //   const docRef = await addDoc(collection(db, "tasks"), {
    //     userId: userId,
    //     title: task.title,
    //     description: task.description,
    //     category: task.category,
    //     dueDate: task.dueDate?.toISOString() || null,
    //     status: task.status,
    //     attachment: task.attachment ? task.attachment.name : null, // Handle file upload separately
    //   });

    //   const newTaskWithId = { ...task, id: docRef.id };
    //   setTasks((prevTasks) => [...prevTasks, newTaskWithId]);
    // } catch (error) {
    //   console.error("Error adding task:", error);
    // }
  };

  const updateTask = (updatedTask: Task) => {
    setCurrentTask(updatedTask);
  };

  const clearTask = () => {
    setCurrentTask({
      title: "",
      description: "",
      category: "",
      dueDate: null,
      status: "",
      attachment: null,
    });
  };

  //   console.log("userid from Taskcontext");
  //   console.log(userId);

  //   console.log(tasks);
  //   console.log("-----");

  return (
    <TaskContext.Provider
      value={{
        tasks,
        addTask,
        currentTask,
        updateTask,
        clearTask,
        filterCategory,
        setFilterCategory,
        filterDate,
        setFilterDate,
        searchQuery,
        setSearchQuery,
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
