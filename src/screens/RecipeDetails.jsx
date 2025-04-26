import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import recipesData from '../server/recipes.json';
import '../styles/RecipeDetails.css';

const RecipeDetails = () => {
  const { id } = useParams();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSaved, setIsSaved] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/recipes/${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch recipe');
        }
        const data = await response.json();
        setRecipe(data);

        // Check if recipe is saved
        // TODO: Replace with actual user ID from auth context
        const userId = 'current-user-id';
        const savedResponse = await fetch(
          `http://localhost:5000/api/saved-recipes?userId=${userId}&recipeId=${id}`
        );
        if (savedResponse.ok) {
          const savedData = await savedResponse.json();
          setIsSaved(savedData.length > 0);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRecipe();
  }, [id]);

  const handleSaveRecipe = async () => {
    try {
      // TODO: Replace with actual user ID from auth context
      const userId = 'current-user-id';
      
      if (isSaved) {
        // Remove from saved
        await fetch(
          `http://localhost:5000/api/saved-recipes?userId=${userId}&recipeId=${id}`,
          { method: 'DELETE' }
        );
      } else {
        // Add to saved
        await fetch('http://localhost:5000/api/saved-recipes', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId, recipeId: id }),
        });
      }
      
      setIsSaved(!isSaved);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleShare = () => {
    alert('Sharing recipe: ' + recipe.name);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleAddToCollection = () => {
    alert('Adding to collection: ' + recipe.name);
  };

  if (!recipe) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="recipe-details-container">
      <div className="recipe-header">
        <img src={recipe.image} alt={recipe.name} className="recipe-main-image" />
        
        <div className="recipe-info-section">
          <h1 className="recipe-title">{recipe.name}</h1>
          
          <div className="recipe-meta">
            <span className="recipe-tag">{recipe.category}</span>
            <div className="recipe-stats">
              <span>{recipe.comments || 0} comments</span>
            </div>
          </div>

          <div className="author-section">
            <img 
              src={recipe.authorPhoto || "https://img.icons8.com/ios-filled/50/ef6c00/user.png"}
              alt={recipe.author}
              className="author-avatar"
            />
            <span className="author-name">{recipe.author}</span>
          </div>

          <div className="recipe-actions">
            <button 
              onClick={handleSaveRecipe}
              className={`save-button ${isSaved ? 'saved' : ''}`}
            >
              {isSaved ? 'Saved' : 'Save Recipe'}
            </button>
            <button className="action-button" onClick={handleAddToCollection}>
              Add to Collection
            </button>
            <button className="action-button" onClick={handleShare}>
              Share
            </button>
            <button className="action-button" onClick={handlePrint}>
              Print
            </button>
          </div>
        </div>
      </div>

      <div className="recipe-sections">
        <div className="ingredients-section">
          <h2>Ingredients</h2>
          <div className="servings-info">
            <span>For {recipe.people || 2} servings</span>
          </div>
          <ul className="ingredients-list">
            {(recipe.ingredients || []).map((ingredient, index) => (
              <li key={index} className="ingredient-item">
                {ingredient}
              </li>
            ))}
          </ul>
        </div>

        <div className="instructions-section">
          <h2>Instructions</h2>
          <div className="cooking-info">
            <span>⏱️ {recipe.cookingTime || '30 minutes'}</span>
          </div>
          <div className="instruction-step">
            {recipe.instruction || 'No instructions available.'}
          </div>
        </div>
      </div>

      <button className="back-button" onClick={() => navigate(-1)}>
        Back to recipes
      </button>
    </div>
  );
};

export default RecipeDetails; 