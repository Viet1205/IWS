import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import logo from "../assets/logo.jpg";

function PersonalKitchen() {
  const navigate = useNavigate();
  const [activeItem, setActiveItem] = useState('collection');
  const [isEditing, setIsEditing] = useState(false);
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((firebaseUser) => {
      if (firebaseUser) {
        // Get user data from your users.json or create default values
        fetch('/src/server/users.json')
          .then(response => response.json())
          .then(users => {
            const existingUser = users.find(u => u.email === firebaseUser.email);
            
            // Combine Firebase data with local data or create defaults
            const combinedUserInfo = {
              id: existingUser?.id || firebaseUser.uid || Math.random().toString(36).substr(2, 9),
              displayName: existingUser?.displayName || firebaseUser.displayName || "Add Nick Name",
              email: existingUser?.email || firebaseUser.email || "Add Email",
              photoURL: existingUser?.photoURL || firebaseUser.photoURL || "https://th.bing.com/th/id/OIP.YPe5zNjdWy-GukFdseuXbQHaHa?w=203&h=203&c=7&r=0&o=5&dpr=1.3&pid=1.7",
              bio: existingUser?.bio || "Add Bio",
              createdAt: existingUser?.createdAt || firebaseUser.metadata.creationTime || new Date().toISOString(),
              kitchenFriends: existingUser?.kitchenFriends || 0,
              followers: existingUser?.followers || 0
            };

            setUserInfo(combinedUserInfo);
          })
          .catch(error => {
            console.error('Error loading user data:', error);
            // Create default user info if JSON fetch fails
            const defaultUserInfo = {
              id: firebaseUser.uid || Math.random().toString(36).substr(2, 9),
              displayName: firebaseUser.displayName || "Add Nick Name",
              email: firebaseUser.email || "Add Email",
              photoURL: firebaseUser.photoURL || "https://th.bing.com/th/id/OIP.YPe5zNjdWy-GukFdseuXbQHaHa?w=203&h=203&c=7&r=0&o=5&dpr=1.3&pid=1.7",
              bio: "Add Bio",
              createdAt: firebaseUser.metadata.creationTime || new Date().toISOString(),
              kitchenFriends: 0,
              followers: 0
            };
            setUserInfo(defaultUserInfo);
          });
      } else {
        navigate('/');
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  if (!userInfo) {
    return (
      <div className="personal-kitchen-empty">
        <h2>Loading...</h2>
      </div>
    );
  }

  return (
    <div className="homepage">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-logo">
          <img
            src={logo}
            alt="Cooking App Logo"
            style={{ width: '50px', height: '50px', objectFit: 'cover' }}
          />
          <span>Cooking App</span>
        </div>

        <div 
          className={`sidebar-item ${activeItem === "search" ? "active" : ""}`}
          onClick={() => setActiveItem("search")}
        >
          <img
            src="https://img.icons8.com/ios-filled/50/ef6c00/search.png"
            alt="Search Icon"
          />
          <span>Search</span>
        </div>

        <div 
          className={`sidebar-item ${activeItem === "premium" ? "active" : ""}`}
          onClick={() => setActiveItem("premium")}
        >
          <img
            src="https://img.icons8.com/ios-filled/50/ef6c00/crown.png"
            alt="Premium Icon"
          />
          <span>Premium</span>
        </div>

        <div 
          className={`sidebar-item ${activeItem === "stats" ? "active" : ""}`}
          onClick={() => setActiveItem("stats")}
        >
          <img
            src="https://img.icons8.com/ios-filled/50/ef6c00/statistics.png"
            alt="Stats Icon"
          />
          <span>Recipe Stats</span>
        </div>

        <div 
          className={`sidebar-item ${activeItem === "challenges" ? "active" : ""}`}
          onClick={() => setActiveItem("challenges")}
        >
          <img
            src="https://img.icons8.com/ios-filled/50/ef6c00/trophy.png"
            alt="Challenges Icon"
          />
          <span>Challenges</span>
        </div>

        <div 
          className={`sidebar-item ${activeItem === "collection" ? "active" : ""}`}
          onClick={() => setActiveItem("collection")}
        >
          <img
            src="https://img.icons8.com/ios-filled/50/ef6c00/bookmark.png"
            alt="Collection Icon"
          />
          <span>Your Collection</span>
        </div>

        <div className="sidebar-item">
          <span style={{ marginLeft: "28px", fontSize: "0.9rem", color: "#888" }}>ALL RECIPES</span>
        </div>

        <div 
          className={`sidebar-item ${activeItem === "recipes" ? "active" : ""}`}
          onClick={() => setActiveItem("recipes")}
        >
          <img
            src="https://img.icons8.com/ios-filled/50/ef6c00/cookbook.png"
            alt="Recipes Icon"
          />
          <span>All Recipes</span>
        </div>

        <div 
          className={`sidebar-item ${activeItem === "saved" ? "active" : ""}`}
          onClick={() => setActiveItem("saved")}
        >
          <img
            src="https://img.icons8.com/ios-filled/50/ef6c00/hearts.png"
            alt="Saved Icon"
          />
          <span>Saved</span>
        </div>

        <div 
          className={`sidebar-item ${activeItem === "cooked" ? "active" : ""}`}
          onClick={() => setActiveItem("cooked")}
        >
          <img
            src="https://img.icons8.com/ios-filled/50/ef6c00/checked-checkbox.png"
            alt="Cooked Icon"
          />
          <span>Cooked</span>
        </div>

        <div 
          className={`sidebar-item ${activeItem === "my-recipes" ? "active" : ""}`}
          onClick={() => setActiveItem("my-recipes")}
        >
          <img
            src="https://img.icons8.com/ios-filled/50/ef6c00/user-cooking.png"
            alt="Your Recipes Icon"
          />
          <span>Your Recipes</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <div className="kitchen-header">
          <div className="back-edit-container">
            <button className="back-button" onClick={() => navigate('/home')}>
              <span>←</span>Back to Home
            </button>
            <button className="edit-button" onClick={() => setIsEditing(!isEditing)}>
              <img 
                src="https://img.icons8.com/ios-filled/50/ef6c00/edit.png" 
                alt="Edit"
              />
              <span>{isEditing ? 'Save Changes' : 'Edit Profile'}</span>
            </button>
          </div>
        </div>

        <div className="personal-kitchen">
          <div className="profile-header">
            <div className="profile-cover"></div>
            <div className="profile-info">
              <img 
                src={userInfo.photoURL} 
                alt={userInfo.displayName} 
                className="profile-avatar"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://th.bing.com/th/id/OIP.YPe5zNjdWy-GukFdseuXbQHaHa?w=203&h=203&c=7&r=0&o=5&dpr=1.3&pid=1.7";
                }}
              />
              <div className="profile-details">
                <h1>{userInfo.displayName}</h1>
                <p className="bio">{userInfo.bio}</p>
                <div className="stats">
                  <div className="stat-item">
                    <span className="stat-value">{userInfo.kitchenFriends}</span>
                    <span className="stat-label">Kitchen Friends</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-value">{userInfo.followers}</span>
                    <span className="stat-label">Followers</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="kitchen-content">
            <div className="section">
              <h2>About Me</h2>
              <div className="about-details">
                <p><strong>Email:</strong> {userInfo.email}</p>
                <p><strong>Joined:</strong> {new Date(userInfo.createdAt).toLocaleDateString()}</p>
              </div>
            </div>

            <div className="section">
              <h2>My Recipes</h2>
              <div className="recipes-grid">
                <div className="empty-state">
                  <p>No recipes shared yet</p>
                  <button className="primary-button">Share Your First Recipe</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PersonalKitchen; 