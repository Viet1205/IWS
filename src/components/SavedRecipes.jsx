import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/SavedRecipes.css';

const SavedRecipes = () => {
  const [savedRecipes, setSavedRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSavedRecipes = async () => {
      try {
        // TODO: Replace with actual user ID from auth context
        const userId = 'current-user-id';
        const response = await fetch(`http://localhost:5000/api/saved-recipes?userId=${userId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch saved recipes');
        }
        
        const data = await response.json();
        setSavedRecipes(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSavedRecipes();
  }, []);

  const handleRemoveSaved = async (recipeId) => {
    try {
      // TODO: Replace with actual user ID from auth context
      const userId = 'current-user-id';
      const response = await fetch(
        `http://localhost:5000/api/saved-recipes?userId=${userId}&recipeId=${recipeId}`,
        { method: 'DELETE' }
      );

      if (!response.ok) {
        throw new Error('Failed to remove saved recipe');
      }

      setSavedRecipes(prevRecipes => 
        prevRecipes.filter(recipe => recipe.recipeId !== recipeId)
      );
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return <div className="loading">Loading saved recipes...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  return (
    <div className="saved-recipes-container">
      <h2>Saved Recipes</h2>
      {savedRecipes.length === 0 ? (
        <div className="no-saved-recipes">
          <p>You haven't saved any recipes yet.</p>
          <button onClick={() => navigate('/recipes')}>
            Browse Recipes
          </button>
        </div>
      ) : (
        <div className="saved-recipes-grid">
          {savedRecipes.map((savedRecipe) => (
            <div key={savedRecipe.id} className="saved-recipe-card">
              <div className="recipe-image">
                <img 
                  src={savedRecipe.recipeImage || 'https://via.placeholder.com/300x200'} 
                  alt={savedRecipe.recipeTitle}
                />
              </div>
              <div className="recipe-info">
                <h3>{savedRecipe.recipeTitle}</h3>
                <p>Saved on: {new Date(savedRecipe.savedAt).toLocaleDateString()}</p>
                <div className="recipe-actions">
                  <button 
                    onClick={() => navigate(`/recipe/${savedRecipe.recipeId}`)}
                    className="view-recipe"
                  >
                    View Recipe
                  </button>
                  <button 
                    onClick={() => handleRemoveSaved(savedRecipe.recipeId)}
                    className="remove-saved"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SavedRecipes; 