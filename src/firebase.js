import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBnfZ5uVjcoAhPNS1nvmwKL_eRY3ZR6G7c",
  authDomain: "cookingapp-943f6.firebaseapp.com",
  projectId: "cookingapp-943f6",
  storageBucket: "cookingapp-943f6.firebasestorage.app",
  messagingSenderId: "536822225126",
  appId: "1:536822225126:web:8eb8e7fcf45e6a1b2f0327",
  measurementId: "G-XNETX3CLCQ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { auth, googleProvider };