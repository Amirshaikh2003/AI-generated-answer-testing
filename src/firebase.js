import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";

// Firebase configuration - REPLACE THESE VALUES WITH YOUR ACTUAL FIREBASE CONFIG
// Get these from your Firebase Console > Project Settings > General > Your apps > Firebase SDK snippet
const firebaseConfig = {
  apiKey: "AIzaSyDzrmYBnu6Q4UW5dW1wgAi5t2FrZklCKsY",
  authDomain: "question-and-answer-d6eba.firebaseapp.com",
  databaseURL: "https://question-and-answer-d6eba-default-rtdb.firebaseio.com",
  projectId: "question-and-answer-d6eba",
  storageBucket: "question-and-answer-d6eba.firebasestorage.app",
  messagingSenderId: "336548900448",
  appId: "1:336548900448:web:244a50135c7236fb165d05",
  measurementId: "G-PPK27WKRP7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Initialize Realtime Database - handle case where it might not be enabled
let rtdb = null;
let rtdbError = null;
try {
  rtdb = getDatabase(app);
} catch (error) {
  rtdbError = error;
  console.warn("Realtime Database not available:", error);
}

export { db, rtdb, rtdbError };