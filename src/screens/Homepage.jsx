import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { signOut } from "firebase/auth";
import logo from "../assets/logo.jpg"; // Import the logo

function Homepage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeItem, setActiveItem] = useState("collection");

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate("/");
    } catch (err) {
      console.error("Error signing out:", err);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    // Add search functionality here
    console.log("Searching for:", searchQuery);
  };

  return (
    <div className="homepage">
      <div className="sidebar">
        <div className="sidebar-logo">
          <img
            src={logo}
            alt="Cooking App Logo"
            style={{ width: '50px', height: '50px', objectFit: 'cover' }}
          />
          <span>Cooking App</span>
        </div>

        {/* Main Navigation */}
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

        {/* Collection Section */}
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

        {/* Recipe Categories */}
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

      <div className="main-content">
        <div className="top-bar">
          <form className="search-bar" onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="Search recipes, ingredients, or users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit">Search</button>
          </form>
          <button onClick={handleSignOut} className="logout-button">
            Sign Out
          </button>
        </div>

        <div className="popular-searches">
          <h3>Popular Searches</h3>
          <div className="search-tags">
            <span className="search-tag">Quick & Easy</span>
            <span className="search-tag">Vegetarian</span>
            <span className="search-tag">Healthy</span>
            <span className="search-tag">Desserts</span>
            <span className="search-tag">Dinner</span>
            <span className="search-tag">30-Minute Meals</span>
          </div>
        </div>

        <div className="recipe-section">
          <h3>Trending Recipes</h3>
          <div className="recipe-grid">
            {/* Recipe cards */}
            {[1, 2, 3, 4, 5, 6, 7, 8].map((index) => (
              <div key={index} className="recipe-card">
                <img
                  src={`https://source.unsplash.com/featured/300x200?cooking,food&sig=${index}`}
                  alt={`Recipe ${index}`}
                />
                <div className="recipe-card-content">
                  <h4>Delicious Recipe {index}</h4>
                  <p>Chef Name</p>
                  <div className="cook-snaps">
                    <img
                      src="https://img.icons8.com/ios-filled/50/ef6c00/camera.png"
                      alt="Cook Snap Icon"
                    />
                    {Math.floor(Math.random() * 10) + 1} cooksnaps
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Homepage;