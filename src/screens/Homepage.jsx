import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { signOut } from "firebase/auth";
import logo from "../assets/logo.jpg"; // Import the logo
import recipesData from "../server/recipes.json";
import categoriesData from "../server/categories.json";
import userData from "../server/users.json";
import SearchSuggestions from "../components/SearchSuggestions";

function Homepage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeItem, setActiveItem] = useState("collection");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [recipes, setRecipes] = useState(recipesData);
  const [users, setUsers] = useState(userData);
  const [categories, setCategories] = useState([]);
  const [filteredRecipes, setFilteredRecipes] = useState(recipesData);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [userInfo, setUserInfo] = useState(null);

  // Default avatar URL for when author photo is not available
  const defaultAvatar = "https://img.icons8.com/ios-filled/50/ef6c00/user.png";

  // Fetch initial data
  useEffect(() => {
    setRecipes(recipesData);
    setCategories(categoriesData);
    setFilteredRecipes(recipesData);
  }, []);

  useEffect(() => {
    // Find the first user from users.json as demo user
    // In a real app, this would come from authentication
    setCurrentUser(users[0]);
  }, [users]);

  useEffect(() => {
    // Fetch user information
    const fetchUserInfo = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          const userInfo = {
            name: user.displayName,
            email: user.email,
            photoURL: user.photoURL
          };
          setUserInfo(userInfo);
        }
      } catch (err) {
        console.error("Error fetching user info:", err);
      }
    };

    fetchUserInfo();
  }, []);

  // Handle search suggestions with debouncing
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchSuggestions([]);
      return;
    }

    const suggestions = recipes.filter(recipe => 
      recipe.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      recipe.category.toLowerCase().includes(searchQuery.toLowerCase())
    ).slice(0, 5);

    setSearchSuggestions(suggestions);
  }, [searchQuery, recipes]);

  const performSearch = (query) => {
    setIsLoading(true);
    setIsSearching(true);
    
    const results = recipes.filter(recipe =>
      recipe.name.toLowerCase().includes(query.toLowerCase()) ||
      recipe.category.toLowerCase().includes(query.toLowerCase())
    );

    setFilteredRecipes(results);
    setIsLoading(false);
  };

  const handleSignOut = async (e) => {
    e.stopPropagation(); // Prevent event bubbling
    try {
      await signOut(auth);
      navigate('/');
    } catch (err) {
      console.error("Error signing out:", err);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setShowSuggestions(false);
    performSearch(searchQuery);
  };

  const handleSearchFocus = () => {
    setShowSuggestions(true);
  };

  const handleSearchBlur = () => {
    setTimeout(() => setShowSuggestions(false), 200);
  };

  const handleSuggestionClick = (suggestion) => {
    setSearchQuery(suggestion.name);
    setShowSuggestions(false);
    performSearch(suggestion.name);
  };

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
    const categoryRecipes = recipes.filter(recipe => 
      recipe.category.toLowerCase() === category.toLowerCase()
    );
    setFilteredRecipes(categoryRecipes);
    setIsSearching(true);
  };

  const handleBackToCategories = () => {
    setSelectedCategory(null);
    setIsSearching(false);
    setFilteredRecipes(recipes);
  };

  const getAuthorPhoto = (authorName) => {
    // Find the user with the matching displayName
    const author = users.find(user => user.displayName === authorName);
    
    // Log for debugging
    console.log("Avatar URL for", authorName, "→", author ? author.photoURL : "Not found");

    // Return the author's photoURL if found, otherwise return the default avatar
    return author && author.photoURL ? author.photoURL : defaultAvatar;
  };

  const toggleDropdown = (e) => {
    e.stopPropagation(); // Prevent event bubbling
    setShowDropdown(!showDropdown);
  };

  const handlePersonalKitchen = (e) => {
    e.stopPropagation(); // Prevent event bubbling
    setShowDropdown(false);
    navigate('/kitchen');
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setShowDropdown(false);
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

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
          <div className="search-container">
            <form className="search-bar" onSubmit={handleSearch}>
              <input
                type="text"
                placeholder="Search recipes, ingredients, or categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={handleSearchFocus}
                onBlur={handleSearchBlur}
              />
              <button type="submit" disabled={isLoading}>
                {isLoading ? 'Search' : 'Search'}
              </button>
            </form>
            {showSuggestions && (
              <SearchSuggestions
                suggestions={searchSuggestions}
                onSuggestionClick={handleSuggestionClick}
              />
            )}
          </div>
          
          <div className="user-dropdown" onClick={toggleDropdown}>
            <img 
              src={userInfo?.photoURL || "https://th.bing.com/th/id/OIP.YPe5zNjdWy-GukFdseuXbQHaHa?w=203&h=203&c=7&r=0&o=5&dpr=1.3&pid=1.7"} 
              alt={userInfo?.displayName || "User"} 
              className="user-avatar"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "https://th.bing.com/th/id/OIP.YPe5zNjdWy-GukFdseuXbQHaHa?w=203&h=203&c=7&r=0&o=5&dpr=1.3&pid=1.7";
              }}
            />
            <div className={`dropdown-menu ${showDropdown ? 'active' : ''}`}>
              <div className="dropdown-item" onClick={handlePersonalKitchen}>
                <img 
                  src="https://img.icons8.com/ios-filled/50/ef6c00/kitchen.png" 
                  alt="Kitchen"
                />
                <span>Personal Kitchen</span>
              </div>
              <div className="dropdown-item" onClick={handleSignOut}>
                <img 
                  src="https://img.icons8.com/ios-filled/50/ef6c00/exit.png" 
                  alt="Sign Out"
                />
                <span>Sign Out</span>
              </div>
            </div>
          </div>
        </div>

        {!isSearching ? (
          <>
            <div className="categories-container">
              <h2 className="categories-heading">Categories</h2>
              <div className="categories-grid">
                {categoriesData.map((category) => (
                  <div key={category.id} className="category-card" onClick={() => handleCategoryClick(category.id)}>
                    <img src={category.image} alt={`${category.name} Category`} />
                    <span className="category-name">{category.name} </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="recipe-section">
              <h3>See what everyone is cooking!</h3>
              <div className="recipe-grid">
                {filteredRecipes.map((recipe) => (
                  <div key={recipe.id} className="recipe-card">
                    <img src={recipe.image} alt={recipe.name} />
                    <div className="recipe-card-content">
                      <h4>{recipe.name}</h4>
                      <div className="author">
                        <img 
                          src={getAuthorPhoto(recipe.author)} 
                          alt={recipe.author} 
                          className="author-photo"
                        />
                        <span>{recipe.author}</span>
                      </div>
                      <div className="recipe-info">
                        <span className="recipe-category">{recipe.category}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="category-view">
            <div className="category-header">
              <button onClick={handleBackToCategories} className="back-button">
                <span>←</span> Back to Categories
              </button>
              <h2>
                {selectedCategory ? (
                  <>
                    ({filteredRecipes.length}) {selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)}
                  </>
                ) : (
                  `Search Results: ${searchQuery}`
                )}
              </h2>
            </div>

            {!isLoading && filteredRecipes.length === 0 ? (
              <div className="no-results">
                <p>No recipes found {selectedCategory ? `in ${selectedCategory}` : `matching "${searchQuery}"`}</p>
                <button onClick={handleBackToCategories}>View All Recipes</button>
              </div>
            ) : (
              <div className="recipe-list">
                {filteredRecipes.map((recipe) => (
                  <div key={recipe.id} className="recipe-list-item">
                    <img src={recipe.image} alt={recipe.name} className="recipe-thumbnail" />
                    <div className="recipe-details">
                      <h3>{recipe.name}</h3>
                      <div className="recipe-metadata">
                        <span className="cooking-time">
                          <img src="https://img.icons8.com/ios-filled/50/000000/time.png" alt="time" />
                          {recipe.cookingTime || "N/A"}
                        </span>
                        <span className="servings">
                          <img src="https://img.icons8.com/ios-filled/50/000000/restaurant.png" alt="people" />
                          {recipe.people || "N/A"} people
                        </span>
                      </div>
                      <div className="recipe-ingredients">
                        {recipe.ingredients.slice(0, 3).join(", ")}
                        {recipe.ingredients.length > 3 && "..."}
                      </div>
                      <div className="author-info">
                        <img 
                          src={getAuthorPhoto(recipe.author)} 
                          alt={recipe.author} 
                          className="author-photo"
                        />
                        <span>{recipe.author}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Homepage;