import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyAbxibUGUYG-DY1ZUVTKehvazHwIts-U_4",
  authDomain: "xtaskbuddy.firebaseapp.com",
  projectId: "xtaskbuddy",
  storageBucket: "xtaskbuddy.firebasestorage.app",
  messagingSenderId: "537546629941",
  appId: "1:537546629941:web:70e2fe58fe7be73e9a227c",
  measurementId: "G-3RKEWY3QK0",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// const analytics = getAnalytics(app);
