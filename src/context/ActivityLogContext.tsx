import { createContext, useContext, useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  Timestamp,
} from "firebase/firestore";
import { db } from "../firebaseConfig";

import dayjs from "dayjs";

import { ActivityLog, ActivityLogContextType } from "../types/types";
import { useTask } from "../context/TaskContext";

const ActivityLogContext = createContext<ActivityLogContextType | undefined>(
  undefined
);

export const ActivityLogProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { currentTask } = useTask();
  const [logs, setLogs] = useState<ActivityLog[]>([]);

  useEffect(() => {
    if (currentTask?.id) {
      const unsubscribe = fetchLogs(currentTask.id);
      return () => unsubscribe(); // Cleanup the listener when the component unmounts or task changes
    }
  }, [currentTask]);

  const fetchLogs = (taskId: string) => {
    if (!taskId) return () => {};

    const q = query(
      collection(db, "activity_logs"),
      where("taskId", "==", taskId)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedLogs = snapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() } as ActivityLog)
      );
      setLogs(fetchedLogs);
    });

    return unsubscribe; // Return the unsubscribe function to clean up on unmount
  };

  const logActivity = async (
    taskId: string,
    changes: Record<string, [any, any]>,
    userId: string,
    isCreated: boolean
  ) => {
    if (!isCreated && Object.keys(changes).length === 0) {
      console.warn("No changes detected.");
      return;
    }

    // Ensure dueDate is stored as Firestore Timestamp
    const processedChanges = Object.entries(changes).reduce(
      (acc, [key, [oldValue, newValue]]) => {
        // Skip if the old and new values are identical
        if (oldValue === newValue) return acc;

        if (key === "dueDate") {
          let oldTimestamp = oldValue;
          let newTimestamp = newValue;

          if (oldValue instanceof Timestamp) {
            oldTimestamp = oldValue; // Already a Firestore Timestamp
          } else if (dayjs.isDayjs(oldValue)) {
            oldTimestamp = Timestamp.fromDate(oldValue.startOf("day").toDate());
          }

          if (dayjs.isDayjs(newValue)) {
            newTimestamp = Timestamp.fromDate(newValue.startOf("day").toDate());
          }

          acc[key] = [oldTimestamp, newTimestamp];
        } else {
          // Store other fields as they are
          acc[key] = [oldValue, newValue];
        }
        return acc;
      },
      {} as Record<string, [any, any]>
    );

    // Check if there are no valid changes to log
    if (!isCreated && Object.keys(processedChanges).length === 0) {
      console.warn("No valid changes detected.");
      return;
    }

    const newLog: Omit<ActivityLog, "id"> = {
      taskId,
      changes: processedChanges,
      timestamp: Timestamp.fromDate(new Date()),
      userId,
      isCreated,
    };

    await addDoc(collection(db, "activity_logs"), newLog);
  };

  return (
    <ActivityLogContext.Provider value={{ logs, fetchLogs, logActivity }}>
      {children}
    </ActivityLogContext.Provider>
  );
};

export const useActivityLog = () => {
  const context = useContext(ActivityLogContext);
  if (!context) {
    throw new Error(
      "useActivityLog must be used within an ActivityLogProvider"
    );
  }
  return context;
};
