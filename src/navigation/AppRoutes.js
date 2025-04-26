import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { auth } from '../firebase';
import { App } from '../App';
import SignIn from '../components/SignIn';
import SignUp from '../components/SignUp';
import Homepage from '../screens/Homepage';
import Recipes from '../components/Recipes';
import Favorites from '../components/Favorites';
import RecipeDetails from '../screens/RecipeDetails';
import PersonalKitchen from '../screens/PersonalKitchen';

// Protected Route wrapper
const PrivateRoute = ({ children }) => {
  return auth.currentUser ? children : <Navigate to="/signin" />;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Navigate to="/signin" />} />
      <Route path="/signin" element={<SignIn />} />
      <Route path="/signup" element={<SignUp />} />

      {/* Protected Routes */}
      <Route
        path="/homepage"
        element={
          <PrivateRoute>
            <Homepage />
          </PrivateRoute>
        }
      />
      <Route
        path="/recipes"
        element={
          <PrivateRoute>
            <Recipes />
          </PrivateRoute>
        }
      />
      <Route
        path="/favorites"
        element={
          <PrivateRoute>
            <Favorites />
          </PrivateRoute>
        }
      />

      {/* Additional Routes */}
      <Route path="/recipe/:id" element={<RecipeDetails />} />
      <Route path="/kitchen" element={<PersonalKitchen />} />

      {/* Fallback Route */}
      <Route path="*" element={<Navigate to="/signin" />} />
    </Routes>
  );
};

export default AppRoutes; 