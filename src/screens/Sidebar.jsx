import React from 'react';
import { useNavigate } from 'react-router-dom';
import logo from "../assets/logo.jpg";

function Sidebar({ activeItem, setActiveItem }) {
  const navigate = useNavigate();

  const handleNavigation = (item, path, state = {}) => {
    setActiveItem(item);
    navigate(path, { state });
  };

  return (
    <div className="sidebar">
      <div className="sidebar-logo" onClick={() => handleNavigation('home', '/home')}>
        <img src={logo} alt="Cooking App Logo" style={{ width: '50px', height: '50px', objectFit: 'cover' }} />
        <span>Cooking App</span>
      </div>

      <div
        className={`sidebar-item ${activeItem === "search" ? "active" : ""}`}
        onClick={() => handleNavigation("search", "/home")}
      >
        <img src="https://img.icons8.com/ios-filled/50/ef6c00/search.png" alt="Search Icon" />
        <span>Search</span>
      </div>
      
      <div
        className={`sidebar-item ${activeItem === "saved" ? "active" : ""}`}
        onClick={() => handleNavigation("saved", "/kitchen", { activeTab: "saved" })}
      >
        <img src="https://img.icons8.com/ios-filled/50/ef6c00/bookmark.png" alt="Saved Icon" />
        <span>Saved</span>
      </div>

      <div
        className={`sidebar-item ${activeItem === "my-recipes" ? "active" : ""}`}
        onClick={() => handleNavigation("my-recipes", "/kitchen", { activeTab: "my-recipes" })}
      >
        <img src="https://img.icons8.com/ios-filled/50/ef6c00/cookbook.png" alt="Your Recipes Icon" />
        <span>Your Recipes</span>
      </div>
    </div>
  );
}

export default Sidebar;