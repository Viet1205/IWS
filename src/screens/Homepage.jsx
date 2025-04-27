import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { signOut } from "firebase/auth";
import logo from "../assets/logo.jpg"; // Import the logo
import recipesData from "../server/recipes.json";
import categoriesData from "../server/categories.json";
import userData from "../server/users.json";
import commentsData from "../server/comments.json";
import SearchSuggestions from "../components/SearchSuggestions";
import Sidebar from './Sidebar'; // Import Sidebar
import '../styles/RecipeDetails.css';
import '../styles/CommentPopup.css';

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
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [isSaved, setIsSaved] = useState(false);
  const [showCommentPopup, setShowCommentPopup] = useState(false);
  const [comments, setComments] = useState(commentsData);
  const [newComment, setNewComment] = useState("");

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
    if (!searchQuery || !searchQuery.trim()) {
      setSearchSuggestions([]);
      return;
    }

    const suggestions = recipes.filter(recipe => 
      (recipe.name && recipe.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (recipe.category && recipe.category.toLowerCase().includes(searchQuery.toLowerCase()))
    ).slice(0, 5);

    setSearchSuggestions(suggestions);
  }, [searchQuery, recipes]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery || !searchQuery.trim()) {
      setFilteredRecipes(recipes);
      return;
    }
    setShowSuggestions(false);
    performSearch(searchQuery.trim());
  };

  const handleSearchFocus = () => {
    setShowSuggestions(true);
  };

  const handleSearchBlur = () => {
    setTimeout(() => setShowSuggestions(false), 200);
  };

  const handleSuggestionClick = (suggestion) => {
    if (!suggestion || !suggestion.name) return;
    setSearchQuery(suggestion.name);
    setShowSuggestions(false);
    performSearch(suggestion.name);
  };

  const handleCategoryClick = (category) => {
    if (!category || !category.id) return;
    setSelectedCategory(category.name);
    const categoryRecipes = recipes.filter(recipe => 
      recipe.category && recipe.category.toLowerCase() === category.name.toLowerCase()
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

  const handleRecipeClick = (recipe) => {
    setSelectedRecipe(recipe);
    setIsSearching(false);
  };

  const handleBackToRecipes = () => {
    setSelectedRecipe(null);
  };

  const handleSave = () => {
    if (!selectedRecipe) return;
  
    // Get the current saved recipes from localStorage
    const savedRecipes = JSON.parse(localStorage.getItem('savedRecipes')) || [];
  
    // Check if the recipe is already saved
    const isAlreadySaved = savedRecipes.some(recipe => recipe.id === selectedRecipe.id);
  
    if (isAlreadySaved) {
      // If already saved, remove it
      const updatedRecipes = savedRecipes.filter(recipe => recipe.id !== selectedRecipe.id);
      localStorage.setItem('savedRecipes', JSON.stringify(updatedRecipes));
      alert('Recipe removed from saved recipes.');
    } else {
      // If not saved, add it
      const updatedRecipes = [...savedRecipes, selectedRecipe];
      localStorage.setItem('savedRecipes', JSON.stringify(updatedRecipes));
      alert('Recipe saved successfully!');
    }
  
    // Update the saved state
    setIsSaved(!isSaved);
  };

  const handleShare = () => {
    alert('Sharing recipe: ' + selectedRecipe.name);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleAddToCollection = () => {
    alert('Adding to collection: ' + selectedRecipe.name);
  };

  const performSearch = (query) => {
    if (!query) {
      setFilteredRecipes(recipes);
      return;
    }
    
    setIsLoading(true);
    setIsSearching(true);
    
    const results = recipes.filter(recipe =>
      (recipe.name && recipe.name.toLowerCase().includes(query.toLowerCase())) ||
      (recipe.category && recipe.category.toLowerCase().includes(query.toLowerCase())) ||
      (recipe.ingredients && recipe.ingredients.some(ing => 
        ing && typeof ing === 'string' && ing.toLowerCase().includes(query.toLowerCase())
      ))
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

  const handleSavedClick = () => {
    navigate('/kitchen', { state: { activeTab: 'saved' } });
  };

  const handleCommentClick = () => {
    setShowCommentPopup(true);
  };

  // Load comments from localStorage on initial load
  useEffect(() => {
    const savedComments = localStorage.getItem('comments');
    if (savedComments) {
      setComments(JSON.parse(savedComments));
    }
  }, []);

  // Format date to Vietnamese format
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    
    return `lúc ${hours}:${minutes} ${day} tháng ${month}, ${year}`;
  };

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (!newComment.trim() || !selectedRecipe?.id || !userInfo) return;

    const newCommentData = {
      id: `comment_${Date.now()}`,
      recipeId: selectedRecipe.id,
      authorId: userInfo.id,
      content: newComment.trim(),
      createdAt: new Date().toISOString()
    };

    // Thêm comment mới vào state và comments.json
    const updatedComments = [...comments, newCommentData];
    setComments(updatedComments);

    // Clear input
    setNewComment("");
  };

  const CommentForm = React.memo(({ onSubmit }) => {
    return (
      <form onSubmit={onSubmit} className="comment-form">
        <div className="comment-input-container">
          <img 
            src={userInfo?.photoURL || defaultAvatar} 
            alt={userInfo?.displayName || "User"} 
            className="comment-avatar" 
          />
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Viết bình luận..."
            className="comment-input"
            autoFocus
          />
        </div>
        <button 
          type="submit" 
          className="comment-submit-button"
          disabled={!newComment.trim()}
        >
          Gửi
        </button>
      </form>
    );
  });

  const CommentPopup = ({ recipeId, onClose }) => {
    const recipeComments = comments.filter(comment => comment.recipeId === recipeId);

    const renderComment = (comment) => {
      // Nếu là comment có sẵn từ file (có userId), giữ nguyên thông tin
      if (comment.userId) {
        const user = users.find(u => u.id === comment.userId);
        return (
          <div key={comment.id} className="comment-item">
            <div className="comment-user">
              <img 
                src={user?.photoURL || defaultAvatar} 
                alt={user?.displayName || "User"} 
                className="comment-avatar" 
              />
              <span className="comment-username">{user?.displayName || "Người dùng"}</span>
            </div>
            <p className="comment-content">{comment.content}</p>
            <span className="comment-time">{formatDate(comment.createdAt)}</span>
          </div>
        );
      }
      
      // Nếu là comment mới (có authorId), sử dụng thông tin từ userInfo
      return (
        <div key={comment.id} className="comment-item">
          <div className="comment-user">
            <img 
              src={userInfo?.photoURL || defaultAvatar} 
              alt={userInfo?.name || "User"} 
              className="comment-avatar" 
            />
            <span className="comment-username">{userInfo?.name || "Người dùng"}</span>
          </div>
          <p className="comment-content">{comment.content}</p>
          <span className="comment-time">{formatDate(comment.createdAt)}</span>
        </div>
      );
    };

    return (
      <div className="comment-popup-overlay">
        <div className="comment-popup">
          <div className="comment-popup-header">
            <h3>Bình luận</h3>
            <button onClick={onClose} className="close-button">×</button>
          </div>
          <div className="comment-list">
            {recipeComments.length > 0 ? (
              recipeComments.map(comment => renderComment(comment))
            ) : (
              <p className="no-comments">Chưa có bình luận nào</p>
            )}
          </div>
          <CommentForm onSubmit={handleCommentSubmit} />
        </div>
      </div>
    );
  };

  return (
    <div className="homepage">
      <Sidebar activeItem={activeItem} setActiveItem={setActiveItem} />
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

        {selectedRecipe ? (
          <div className="recipe-details-container">
            <img src={selectedRecipe.image} alt={selectedRecipe.name} className="recipe-main-image" />

            <div className="recipe-header">
              <h1 className="recipe-title">{selectedRecipe.name}</h1>
              <div className="recipe-meta">
                <span className="recipe-tag">{selectedRecipe.category}</span>
                <div className="recipe-stats">
                  <span onClick={handleCommentClick} className="comment-count">Đã có {selectedRecipe.comments || 0} bình luận</span>
                </div>
              </div>
            </div>

            <div className="author-section">
              <img 
                src={selectedRecipe.authorPhoto || "https://img.icons8.com/ios-filled/50/ef6c00/user.png"}
                alt={selectedRecipe.author}
                className="author-avatar"
              />
              <span className="author-name">{selectedRecipe.author}</span>
            </div>

            <div className="recipe-actions">
              <button className="action-button save-button" onClick={handleSave}>
                <span>{isSaved ? 'Saved' : 'Save'}</span>
              </button>
              <button className="action-button" onClick={handlePrint}>
                <span>In</span>
              </button>
            </div>

            <div className="recipe-sections">
              <div className="ingredients-section">
                <h2>Ingredients</h2>
                <div className="servings-info">
                  <span>{selectedRecipe.people || 2} người</span>
                </div>
                <ul className="ingredients-list">
                  {(selectedRecipe.ingredients || []).map((ingredient, index) => (
                    <li key={index} className="ingredient-item">
                      <span>{ingredient}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="instructions-section">
                <h2>Instructions</h2>
                <div className="cooking-info">
                  <span>⏱️ {selectedRecipe.cookingTime || '30 phút'}</span>
                </div>
                <div className="instruction-step">
                  <p>{selectedRecipe.instruction || 'No instructions available.'}</p>
                </div>
              </div>
            </div>

            <button className="back-button" onClick={handleBackToRecipes}>
              Quay lại
            </button>
          </div>
        ) : !isSearching ? (
          <>
            <div className="categories-container">
              <h2 className="categories-heading">Categories</h2>
              <div className="categories-grid">
                {categoriesData.map((category) => (
                  <div 
                    key={category.id} 
                    className="category-card" 
                    onClick={() => handleCategoryClick(category)}
                  >
                    <img src={category.image} alt={`${category.name} Category`} />
                    <span className="category-name">{category.name}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="recipe-section">
              <h3>See what everyone is cooking!</h3>
              <div className="recipe-grid">
                {filteredRecipes.map((recipe) => (
                  <div 
                    key={recipe.id} 
                    className="recipe-card"
                    onClick={() => handleRecipeClick(recipe)}
                    style={{ cursor: 'pointer' }}
                  >
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
                    ({filteredRecipes.length}) {selectedCategory}
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
                  <div 
                    key={recipe.id} 
                    className="recipe-list-item"
                    onClick={() => handleRecipeClick(recipe)}
                    style={{ cursor: 'pointer' }}
                  >
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

      {showCommentPopup && (
        <CommentPopup
          recipeId={selectedRecipe?.id}
          onClose={() => setShowCommentPopup(false)}
        />
      )}
    </div>
  );
}

export default Homepage;