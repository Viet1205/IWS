import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import logo from "../assets/logo.jpg";
import EditProfile from './EditProfile';
import '../styles/EditProfile.css';
import '../styles/RecipeMaking.css';

function PersonalKitchen() {
  const navigate = useNavigate();
  const [activeItem, setActiveItem] = useState('collection');
  const [isEditing, setIsEditing] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [isCreatingRecipe, setIsCreatingRecipe] = useState(false);
  const [recipeForm, setRecipeForm] = useState({
    name: '',
    category: 'dinner',
    cookingTime: '',
    people: 2,
    ingredients: [''],
    instruction: '',
    image: null,
    imagePreview: null
  });
  const fileInputRef = useRef();

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

  const handleSaveProfile = async (updatedData) => {
    try {
      // Update the user info in your database/storage here
      setUserInfo(prevState => ({
        ...prevState,
        ...updatedData
      }));
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      // Handle error (show notification, etc.)
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        alert('Image size should be less than 5MB');
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        // Create an image element for compression
        const img = new Image();
        img.onload = () => {
          // Create canvas for compression
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          // Calculate new dimensions while maintaining aspect ratio
          const maxDimension = 1200;
          if (width > height && width > maxDimension) {
            height = (height * maxDimension) / width;
            width = maxDimension;
          } else if (height > maxDimension) {
            width = (width * maxDimension) / height;
            height = maxDimension;
          }
          
          canvas.width = width;
          canvas.height = height;
          
          // Draw and compress image
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          
          // Convert to compressed base64
          const compressedImage = canvas.toDataURL('image/jpeg', 0.7);
          
          setRecipeForm(prev => ({
            ...prev,
            image: file,
            imagePreview: compressedImage
          }));
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddIngredient = () => {
    setRecipeForm(prev => ({
      ...prev,
      ingredients: [...prev.ingredients, '']
    }));
  };

  const handleRemoveIngredient = (index) => {
    setRecipeForm(prev => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, i) => i !== index)
    }));
  };

  const handleIngredientChange = (index, value) => {
    setRecipeForm(prev => ({
      ...prev,
      ingredients: prev.ingredients.map((ingredient, i) => 
        i === index ? value : ingredient
      )
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!recipeForm.name.trim()) {
      alert('Please enter a recipe title');
      return;
    }
    if (!recipeForm.cookingTime.trim()) {
      alert('Please enter cooking time');
      return;
    }
    if (!recipeForm.imagePreview) {
      alert('Please upload a recipe image');
      return;
    }
    if (recipeForm.ingredients.every(ing => !ing.trim())) {
      alert('Please add at least one ingredient');
      return;
    }
    if (!recipeForm.instruction.trim()) {
      alert('Please enter cooking instructions');
      return;
    }
  
    try {
      const formData = {
        name: recipeForm.name,
        author: userInfo.displayName,
        category: recipeForm.category,
        image: recipeForm.imagePreview,  // Assuming base64 image
        ingredients: recipeForm.ingredients.filter(ing => ing.trim() !== ''),
        instruction: recipeForm.instruction,
        cookingTime: recipeForm.cookingTime,
        people: parseInt(recipeForm.people)
      };
  
      console.log("Sending data to server:", formData);  // Log data before sending
  
      const response = await fetch('http://localhost:5000/api/recipes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
  
      if (!response.ok) {
        const errorText = await response.text();  // Get the error response text
        console.error(`Failed to save recipe: ${response.statusText}`, errorText);
        throw new Error(`Failed to save recipe: ${response.statusText}`);
      }
  
      const savedRecipe = await response.json();
  
      console.log("Saved recipe:", savedRecipe);  // Log the saved recipe response
  
      // Reset form after successful save
      setRecipeForm({
        name: '',
        category: 'dinner',
        cookingTime: '',
        people: 2,
        ingredients: [''],
        instruction: '',
        image: null,
        imagePreview: null
      });
  
      alert('Recipe saved successfully!');
      navigate('/recipe/' + savedRecipe.id);  // Assuming the saved recipe has an 'id'
  
    } catch (error) {
      console.error('Error saving recipe:', error);
      alert('Failed to save recipe. Please try again.');
    }
  };
  

  const renderRecipeMakingScreen = () => (
    <div className="recipe-making-container">
      <div className="recipe-making-header">
        <h1>Create New Recipe</h1>
      </div>

      <form className="recipe-making-form" onSubmit={handleSave}>
        <div className="form-section">
          <div className="form-group">
            <label>Recipe Title</label>
            <input
              type="text"
              value={recipeForm.name}
              onChange={(e) => setRecipeForm(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter recipe title"
            />
          </div>

          <div className="form-group">
            <label>Category</label>
            <select
              value={recipeForm.category}
              onChange={(e) => setRecipeForm(prev => ({ ...prev, category: e.target.value }))}
            >
              <option value="dinner">Dinner</option>
              <option value="lunch">Lunch</option>
              <option value="breakfast">Breakfast</option>
              <option value="snacks">Snacks</option>
              <option value="dessert">Dessert</option>
              <option value="vegetarian">Vegetarian</option>
            </select>
          </div>

          <div className="form-group">
            <label>Cooking Time</label>
            <input
              type="text"
              value={recipeForm.cookingTime}
              onChange={(e) => setRecipeForm(prev => ({ ...prev, cookingTime: e.target.value }))}
              placeholder="e.g., 30 mins"
            />
          </div>

          <div className="form-group">
            <label>Number of Servings</label>
            <input
              type="number"
              value={recipeForm.people}
              onChange={(e) => setRecipeForm(prev => ({ ...prev, people: e.target.value }))}
              min="1"
            />
          </div>
        </div>

        <div className="form-section">
          <div className="form-group">
            <label>Recipe Image</label>
            <div 
              className="image-upload-section"
              onClick={() => fileInputRef.current.click()}
            >
              {recipeForm.imagePreview ? (
                <img src={recipeForm.imagePreview} alt="Recipe preview" />
              ) : (
                <p>Click to upload an image</p>
              )}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                style={{ display: 'none' }}
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <div className="form-group">
            <label>Ingredients</label>
            <div className="ingredients-list">
              {recipeForm.ingredients.map((ingredient, index) => (
                <div key={index} className="ingredient-item">
                  <input
                    type="text"
                    value={ingredient}
                    onChange={(e) => handleIngredientChange(index, e.target.value)}
                    placeholder="Enter ingredient"
                  />
                  {index > 0 && (
                    <button
                      type="button"
                      className="remove-ingredient"
                      onClick={() => handleRemoveIngredient(index)}
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              type="button"
              className="add-ingredient"
              onClick={handleAddIngredient}
            >
              + Add Ingredient
            </button>
          </div>
        </div>

        <div className="form-section">
          <div className="form-group">
            <label>Instructions</label>
            <textarea
              value={recipeForm.instruction}
              onChange={(e) => setRecipeForm(prev => ({ ...prev, instruction: e.target.value }))}
              placeholder="Enter cooking instructions"
            />
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="save-recipe">
            Save Recipe
          </button>
          <button
            type="button"
            className="cancel-recipe"
            onClick={() => setIsCreatingRecipe(false)}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );

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
              <span>{isEditing ? 'Cancel Edit' : 'Edit Profile'}</span>
            </button>
          </div>
        </div>

        <div className="personal-kitchen">
          {isCreatingRecipe ? (
            renderRecipeMakingScreen()
          ) : isEditing ? (
            <EditProfile
              userInfo={userInfo}
              onSave={handleSaveProfile}
              onCancel={handleCancelEdit}
            />
          ) : (
            <>
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
                      <button 
                        className="primary-button"
                        onClick={() => setIsCreatingRecipe(true)}
                      >
                        Share Your First Recipe
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default PersonalKitchen; 