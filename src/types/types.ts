import { Dayjs } from "dayjs";
import { Timestamp } from "firebase/firestore";
import { User } from "firebase/auth";

//AuthContext
export interface AuthContextType {
  user: User | null;
  view: "list" | "board";
  setView: (view: "list" | "board") => void;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

//ActivityLogContext
export interface ActivityLog {
  id?: string;
  taskId: string;
  changes: Record<string, [any, any]>;
  timestamp: Timestamp;
  userId: string;
  isCreated: boolean;
}

export interface ActivityLogContextType {
  logs: ActivityLog[];
  fetchLogs: (taskId: string) => () => void;
  logActivity: (
    taskId: string,
    changes: Record<string, [any, any]>,
    userId: string,
    isCreated: boolean
  ) => Promise<void>;
}

//ListView
export interface StatusChangePopupProps {
  onUpdateStatus: (status: string) => void;
}

// Task context
export interface Task {
  id?: string; // Firestore will assign this
  title: string;
  description: string;
  category: string;
  dueDate: Dayjs | null;
  status: string;
  attachment: File | "";
  attachmentUrl?: string | null;
}

export interface TaskContextType {
  tasks: Task[]; // Store multiple tasks
  filteredTasks: Task[];
  currentTask: Task | null;

  setCurrentTask: (task: Task | null) => void;

  // Function to add, update, delete tasks
  addTask: (task: Task) => Promise<string | null>;
  updateTask: (updatedTask: Task) => void;
  deleteTask: (taskId: string) => void;

  updateMultipleTasksStatus: (
    tasksToUpdate: Task[],
    newStatus: string
  ) => Promise<void>;
  deleteMultipleTasks: (tasksToDelete: Task[]) => Promise<void>;

  // form
  openForm: boolean;
  setOpenForm: (open: boolean) => void;

  // Filters
  filterCategory: string;
  setFilterCategory: (category: string) => void;
  filterDate: Dayjs | null;
  setFilterDate: (date: Dayjs | null) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isSearching: boolean;
  setIsSearching: (value: boolean) => void;
}
