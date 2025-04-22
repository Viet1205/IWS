import React from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';

const Navigation = () => {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await auth.signOut();
      navigate('/signin');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <nav className="navbar">
      <div className="nav-brand">Cooking App</div>
      <div className="nav-links">
        <button onClick={() => navigate('/homepage')}>Home</button>
        <button onClick={() => navigate('/recipes')}>Recipes</button>
        <button onClick={() => navigate('/favorites')}>Favorites</button>
        <button onClick={handleSignOut}>Sign Out</button>
      </div>
    </nav>
  );
};

export default Navigation; 