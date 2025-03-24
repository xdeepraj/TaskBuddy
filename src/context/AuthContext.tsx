import { createContext, useContext, useEffect, useState } from "react";
import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User,
} from "firebase/auth";
import { auth, db } from "../firebaseConfig";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";

import { AuthContextType } from "../types/types";

const AuthContext = createContext<AuthContextType | null>(null);

// Global variable to track listeners
let activeAuthListeners = 0;

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<"list" | "board">("list");

  useEffect(() => {
    // If there's already a listener, we don't add another one
    if (activeAuthListeners === 0) {
      const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
        if (currentUser) {
          await saveUserToFirestore(currentUser);
          await loadUserView(currentUser.uid);
        }
        setUser(currentUser);
      });

      activeAuthListeners += 1;

      // Cleanup on unmount
      return () => {
        unsubscribe();
        activeAuthListeners -= 1;
      };
    }
  }, []);

  // Save user data to Firestore
  const saveUserToFirestore = async (user: User) => {
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      await setDoc(userRef, {
        uid: user.uid,
        name: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
        createdAt: new Date(),
        view: "list",
      });
    }
  };

  // Load user's last view from Firestore
  const loadUserView = async (uid: string) => {
    const userRef = doc(db, "users", uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const data = userSnap.data();
      setView(data.view || "list");
    }
  };

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const logout = async () => {
    try {
      // Double-check if user is authenticated before accessing Firestore
      if (auth.currentUser && user) {
        const userRef = doc(db, "users", user.uid);
        await updateDoc(userRef, { view });
      }

      // Reset any lingering auth listeners
      auth.onAuthStateChanged(() => {});

      await signOut(auth);
      setUser(null);
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, view, setView, loginWithGoogle, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext) as AuthContextType;
};
