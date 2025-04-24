import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { auth } from "./firebase";
import SignIn from "./screens/SignIn";
import SignUp from "./screens/SignUp";
import Homepage from "./screens/Homepage";
import PersonalKitchen from "./screens/PersonalKitchen";
import userData from "./server/users.json";
import "./styles.css";

// Protected Route wrapper component
function PrivateRoute({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return user ? children : <Navigate to="/" />;
}

// Auth wrapper component to handle authentication state
function AuthWrapper() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  // If user is authenticated, redirect to homepage
  if (user && window.location.pathname === '/') {
    return <Navigate to="/home" />;
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<SignIn />} />
      <Route path="/signup" element={
      
          <SignUp />
      } />

      {/* Protected Routes */}
      <Route path="/home" element={
        <PrivateRoute>
          <Homepage />
        </PrivateRoute>
      } />
      
      <Route path="/kitchen" element={
        <PrivateRoute>
          <PersonalKitchen user={userData[0]} />
        </PrivateRoute>
      } />

      {/* Fallback Route */}
      <Route path="*" element={
        user ? <Navigate to="/home" /> : <Navigate to="/" />
      } />
    </Routes>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthWrapper />
    </BrowserRouter>
  </React.StrictMode>
);