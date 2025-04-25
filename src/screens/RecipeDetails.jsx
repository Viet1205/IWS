import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import recipesData from '../server/recipes.json';
import '../styles/RecipeDetails.css';

function RecipeDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState(null);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const foundRecipe = recipesData.find(r => r.id === id);
    if (foundRecipe) {
      setRecipe(foundRecipe);
    }
  }, [id]);

  const handleSave = () => {
    setIsSaved(!isSaved);
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
      <img src={recipe.image} alt={recipe.name} className="recipe-main-image" />

      <div className="recipe-header">
        <h1 className="recipe-title">{recipe.name}</h1>
        <div className="recipe-meta">
          <span className="recipe-tag">{recipe.category}</span>
          <div className="recipe-stats">
            <span className="comment-count">Đã có {recipe.comments || 0} bình luận</span>
          </div>
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
        <button className="action-button save-button" onClick={handleSave}>
          <span>{isSaved ? 'Đã Lưu' : 'Lưu Món'}</span>
        </button>
        <button className="action-button" onClick={handleAddToCollection}>
          <span>Thêm vào bộ sưu tập</span>
        </button>
        <button className="action-button" onClick={handleShare}>
          <span>Chia sẻ</span>
        </button>
        <button className="action-button" onClick={handlePrint}>
          <span>In</span>
        </button>
      </div>

      <div className="recipe-sections">
        <div className="ingredients-section">
          <h2>Nguyên Liệu</h2>
          <div className="servings-info">
            <span>{recipe.people || 2} người</span>
          </div>
          <ul className="ingredients-list">
            {(recipe.ingredients || []).map((ingredient, index) => (
              <li key={index} className="ingredient-item">
                <span>{ingredient}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="instructions-section">
          <h2>Hướng dẫn cách làm</h2>
          <div className="cooking-info">
            <span>⏱️ {recipe.cookingTime || '30 phút'}</span>
          </div>
          <div className="instruction-step">
            <p>{recipe.instruction || 'No instructions available.'}</p>
          </div>
        </div>
      </div>

      <button className="back-button" onClick={() => navigate(-1)}>
        Quay lại
      </button>
    </div>
  );
}

export default RecipeDetails; 