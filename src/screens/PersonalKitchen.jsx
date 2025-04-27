import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { auth, updateProfile } from '../firebase';
import logo from "../assets/logo.jpg";
import EditProfile from './EditProfile';
import '../styles/EditProfile.css';
import '../styles/RecipeMaking.css';

function PersonalKitchen() {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeItem, setActiveItem] = useState('collection');
  const [isEditing, setIsEditing] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [userRecipes, setUserRecipes] = useState([]);
  const [savedRecipes, setSavedRecipes] = useState([]);
  const [isCreatingRecipe, setIsCreatingRecipe] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
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
  const modalRef = useRef();

  useEffect(() => {
    // Check if we have a state parameter from navigation
    if (location.state?.activeTab) {
      setActiveItem(location.state.activeTab);
    }

    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // First try to get existing user from backend
          const response = await fetch(`http://localhost:5000/api/users/${firebaseUser.uid}`);
          let userData;
          
          if (response.ok) {
            userData = await response.json();
          } else if (response.status === 404) {
            // User doesn't exist in backend, create new user
            const createResponse = await fetch('http://localhost:5000/api/users', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                uid: firebaseUser.uid,
                displayName: firebaseUser.displayName || "Add Nick Name",
                email: firebaseUser.email,
                photoURL: firebaseUser.photoURL || "https://th.bing.com/th/id/OIP.YPe5zNjdWy-GukFdseuXbQHaHa?w=203&h=203&c=7&r=0&o=5&dpr=1.3&pid=1.7",
                bio: "Add Bio",
                kitchenFriends: 0,
                followers: 0
              })
            });
            
            if (!createResponse.ok) {
              throw new Error('Failed to create user in backend');
            }
            
            userData = await createResponse.json();
          } else {
            throw new Error('Failed to fetch user data');
          }

          setUserInfo({
            ...userData,
            createdAt: userData.createdAt || firebaseUser.metadata.creationTime || new Date().toISOString()
          });
        } catch (error) {
          console.error('Error loading user data:', error);
          // Set default user info if backend fails
          const defaultUserInfo = {
            id: firebaseUser.uid,
            displayName: firebaseUser.displayName || "Add Nick Name",
            email: firebaseUser.email,
            photoURL: firebaseUser.photoURL || "https://th.bing.com/th/id/OIP.YPe5zNjdWy-GukFdseuXbQHaHa?w=203&h=203&c=7&r=0&o=5&dpr=1.3&pid=1.7",
            bio: "Add Bio",
            createdAt: firebaseUser.metadata.creationTime || new Date().toISOString(),
            kitchenFriends: 0,
            followers: 0
          };
          setUserInfo(defaultUserInfo);
        }
      } else {
        navigate('/');
      }
    });

    return () => unsubscribe();
  }, [navigate, location.state]);

  // Fetch user's recipes
  useEffect(() => {
    const fetchUserRecipes = async () => {
      if (!userInfo) return;
      
      try {
        const response = await fetch('http://localhost:5000/api/recipes');
        if (!response.ok) {
          throw new Error('Failed to fetch recipes');
        }
        const recipes = await response.json();
        // Filter recipes by the current user
        const userRecipes = recipes.filter(recipe => recipe.author === userInfo.displayName);
        setUserRecipes(userRecipes);
      } catch (error) {
        console.error('Error fetching user recipes:', error);
      }
    };

    fetchUserRecipes();
  }, [userInfo]);

  // Add function to fetch saved recipes
  useEffect(() => {
    const fetchSavedRecipes = () => {
      const savedRecipes = JSON.parse(localStorage.getItem('savedRecipes')) || [];
      setSavedRecipes(savedRecipes);
    };

    fetchSavedRecipes();

    // Listen for changes in localStorage to dynamically update saved recipes
    const handleStorageChange = () => {
      fetchSavedRecipes();
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const handleSaveProfile = async (updatedData) => {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('No authenticated user found');
      }

      // First update backend
      const response = await fetch(`http://localhost:5000/api/users/${user.uid}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          displayName: updatedData.displayName,
          email: updatedData.email,
          photoURL: updatedData.photoURL,
          bio: updatedData.bio,
          uid: user.uid,
          kitchenFriends: userInfo.kitchenFriends,
          followers: userInfo.followers
        })
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Backend update failed:', errorData);
        throw new Error('Failed to update profile in backend');
      }

      const updatedUser = await response.json();

      // Then update Firebase profile with the new photoURL from backend
      try {
        await updateProfile(user, {
          displayName: updatedUser.displayName,
          photoURL: updatedUser.photoURL
        });
      } catch (firebaseError) {
        console.error('Firebase profile update failed:', firebaseError);
        // Don't throw error here, as the backend update was successful
      }

      // Update local state with the response from the backend
      setUserInfo(prevState => ({
        ...prevState,
        ...updatedUser
      }));

      setIsEditing(false);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert(`Failed to update profile: ${error.message}`);
      // Don't close the edit mode on error so user can try again
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
  
      // Add the new recipe to userRecipes
      setUserRecipes(prevRecipes => [...prevRecipes, savedRecipe]);
      
      setIsCreatingRecipe(false);
      alert('Recipe saved successfully!');
  
    } catch (error) {
      console.error('Error saving recipe:', error);
      alert('Failed to save recipe. Please try again.');
    }
  };
  
  const handleRecipeClick = (recipe) => {
    setSelectedRecipe(recipe);
    setIsModalVisible(true);
    // Add a class to prevent body scrolling
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setIsModalVisible(false);
    setSelectedRecipe(null);
    // Restore body scrolling
    document.body.style.overflow = 'auto';
  };

  // Close modal when clicking outside
  const handleOverlayClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      closeModal();
    }
  };

  const handleSavedClick = () => {
    setActiveItem("saved");
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
        <div className="sidebar-logo"
        onClick={() => navigate('/home')}>
          <img
            src={logo}
            alt="Cooking App Logo"
            style={{ width: '50px', height: '50px', objectFit: 'cover' }}
          />
          <span>Cooking App</span>
        </div>

        <div 
          className={`sidebar-item ${activeItem === "search" ? "active" : ""}`}
          onClick={() => {
            navigate('/home')
            setActiveItem("search")
          }}
        >
          <img
            src="https://img.icons8.com/ios-filled/50/ef6c00/search.png"
            alt="Search Icon"
          />
          <span>Search</span>
        </div>
        
        <div 
          className={`sidebar-item ${activeItem === "saved" ? "active" : ""}`}
          onClick={handleSavedClick}
        >
          <img
            src="https://img.icons8.com/ios-filled/50/ef6c00/bookmark.png"
            alt="Saved Icon"
          />
          <span>Saved</span>
        </div>
        <div 
          className={`sidebar-item ${activeItem === "my-recipes" ? "active" : ""}`}
          onClick={() => setActiveItem("my-recipes")}
        >
          <img
            src="https://img.icons8.com/ios-filled/50/ef6c00/cookbook.png"
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
                {activeItem === 'saved' ? (
                  <div className="section">
                    <h2>Saved Recipes</h2>
                    <div className="recipes-grid">
                      {savedRecipes.length === 0 ? (
                        <div className="empty-state">
                          <p>No saved recipes yet</p>
                        </div>
                      ) : (
                        <div className="recipes-list">
                          {savedRecipes.map((recipe) => (
                            <div key={recipe.id} className="recipe-card" onClick={() => handleRecipeClick(recipe)}>
                              <div className="recipe-image">
                                <img src={recipe.image} alt={recipe.name} />
                              </div>
                              <div className="recipe-info">
                                <h3>{recipe.name}</h3>
                                <div className="recipe-metadata">
                                  <span className="cooking-time">
                                    <img src="https://img.icons8.com/ios-filled/50/000000/time.png" alt="time" />
                                    {recipe.cookingTime}
                                  </span>
                                  <span className="servings">
                                    <img src="https://img.icons8.com/ios-filled/50/000000/restaurant.png" alt="servings" />
                                    {recipe.people} servings
                                  </span>
                                </div>
                                <div className="recipe-category">
                                  <span>{recipe.category}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <>
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
                        {userRecipes.length === 0 ? (
                          <div className="empty-state">
                            <p>No recipes shared yet</p>
                          </div>
                        ) : (
                          <div className="recipes-list">
                            {userRecipes.map((recipe) => (
                              <div key={recipe.id} className="recipe-card" onClick={() => handleRecipeClick(recipe)}>
                                <div className="recipe-image">
                                  <img src={recipe.image} alt={recipe.name} />
                                </div>
                                <div className="recipe-info">
                                  <h3>{recipe.name}</h3>
                                  <div className="recipe-metadata">
                                    <span className="cooking-time">
                                      <img src="https://img.icons8.com/ios-filled/50/000000/time.png" alt="time" />
                                      {recipe.cookingTime}
                                    </span>
                                    <span className="servings">
                                      <img src="https://img.icons8.com/ios-filled/50/000000/restaurant.png" alt="servings" />
                                      {recipe.people} servings
                                    </span>
                                  </div>
                                  <div className="recipe-category">
                                    <span>{recipe.category}</span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>
      
      {/* Recipe Detail Modal */}
      {isModalVisible && selectedRecipe && (
        <div 
          className={`recipe-modal-overlay ${isModalVisible ? 'visible' : ''}`}
          onClick={handleOverlayClick}
        >
          <div 
            className={`recipe-modal ${isModalVisible ? 'visible' : ''}`}
            ref={modalRef}
          >
            <div className="recipe-modal-header">
              <h2 className="recipe-modal-title">{selectedRecipe.name}</h2>
              <button className="recipe-modal-close" onClick={closeModal}>×</button>
            </div>
            <div className="recipe-modal-content">
              <img 
                src={selectedRecipe.image} 
                alt={selectedRecipe.name}
                className="recipe-modal-image"
              />
              
              <div className="recipe-modal-metadata">
                <span>
                  <img src="https://img.icons8.com/ios-filled/50/000000/time.png" alt="time" />
                  {selectedRecipe.cookingTime}
                </span>
                <span>
                  <img src="https://img.icons8.com/ios-filled/50/000000/restaurant.png" alt="servings" />
                  {selectedRecipe.people} servings
                </span>
                <span>
                  <img src="https://img.icons8.com/ios-filled/50/000000/category.png" alt="category" />
                  {selectedRecipe.category}
                </span>
              </div>

              <div className="recipe-modal-section">
                <h3>Ingredients</h3>
                <ul className="recipe-ingredients-list">
                  {selectedRecipe.ingredients.map((ingredient, index) => (
                    <li key={index}>{ingredient}</li>
                  ))}
                </ul>
              </div>

              <div className="recipe-modal-section">
                <h3>Instructions</h3>
                <div className="recipe-instructions">
                  {selectedRecipe.instruction}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Action Button */}
      <button 
        className="create-recipe-fab"
        onClick={() => setIsCreatingRecipe(true)}
      >
        +
      </button>
    </div>
  );
}

export default PersonalKitchen; 