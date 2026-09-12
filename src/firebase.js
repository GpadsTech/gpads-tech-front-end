// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from 'firebase/firestore';
import { getAuth } from "firebase/auth";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAJ4vdg3mRSB5blJNjAEgd3WlB2ESEjxJw",
  authDomain: "gpadsfirebase.firebaseapp.com",
  databaseURL: "https://gpadsfirebase-default-rtdb.firebaseio.com",
  projectId: "gpadsfirebase",
  storageBucket: "gpadsfirebase.firebasestorage.app",
  messagingSenderId: "731092353725",
  appId: "1:731092353725:web:0512728d7772e32058edd4",
  measurementId: "G-HK05EB9Z59"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
const analytics = getAnalytics(app);
export const db = getFirestore(app)