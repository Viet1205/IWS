import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDoc, updateDoc, arrayUnion, arrayRemove, Timestamp } from 'firebase/firestore';
import { BiArrowBack } from 'react-icons/bi';
import { AiOutlineClockCircle, AiOutlineHeart, AiFillHeart } from 'react-icons/ai';
import { IoMdPeople } from 'react-icons/io';
import '../styles/RecipeDetail.css';

const RecipeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const auth = getAuth();
  const db = getFirestore();

  const [recipe, setRecipe] = useState(null);
  const [author, setAuthor] = useState(null);
  const [isLiked, setIsLiked] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecipeAndAuthor = async () => {
      try {
        const recipeDoc = await getDoc(doc(db, 'recipes', id));
        if (recipeDoc.exists()) {
          const recipeData = recipeDoc.data();
          setRecipe({ id: recipeDoc.id, ...recipeData });
          
          // Fetch author data
          const authorDoc = await getDoc(doc(db, 'users', recipeData.authorId));
          if (authorDoc.exists()) {
            setAuthor({ id: authorDoc.id, ...authorDoc.data() });
          }

          // Check if current user has liked the recipe
          if (auth.currentUser) {
            setIsLiked(recipeData.likes?.includes(auth.currentUser.uid) || false);
          }
        }
      } catch (error) {
        console.error('Error fetching recipe:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecipeAndAuthor();
  }, [id, db, auth.currentUser]);

  const handleLike = async () => {
    if (!auth.currentUser) {
      navigate('/login');
      return;
    }

    try {
      const recipeRef = doc(db, 'recipes', id);
      const operation = isLiked ? arrayRemove : arrayUnion;
      
      await updateDoc(recipeRef, {
        likes: operation(auth.currentUser.uid)
      });

      setIsLiked(!isLiked);
      setRecipe(prev => ({
        ...prev,
        likes: isLiked 
          ? prev.likes.filter(uid => uid !== auth.currentUser.uid)
          : [...prev.likes, auth.currentUser.uid]
      }));
    } catch (error) {
      console.error('Error updating like:', error);
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    
    if (!auth.currentUser) {
      navigate('/login');
      return;
    }

    if (!commentText.trim()) return;

    try {
      const recipeRef = doc(db, 'recipes', id);
      const newComment = {
        userId: auth.currentUser.uid,
        text: commentText.trim(),
        timestamp: Timestamp.now(),
        userEmail: auth.currentUser.email,
        userName: auth.currentUser.displayName || auth.currentUser.email
      };

      await updateDoc(recipeRef, {
        comments: arrayUnion(newComment)
      });

      setRecipe(prev => ({
        ...prev,
        comments: [...(prev.comments || []), newComment]
      }));
      setCommentText('');
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  if (loading) {
    return <div className="recipe-detail">Loading...</div>;
  }

  if (!recipe) {
    return <div className="recipe-detail">Recipe not found</div>;
  }

  return (
    <div className="recipe-detail">
      <div className="recipe-detail-header">
        <button className="back-button" onClick={() => navigate(-1)}>
          <BiArrowBack />
          Back to recipes
        </button>
      </div>

      <div className="recipe-detail-content">
        <div className="recipe-main-image">
          <img src={recipe.image} alt={recipe.title} />
        </div>

        <div className="recipe-info-section">
          <h1>{recipe.title}</h1>

          <div className="recipe-author">
            <img 
              src={author?.photoURL || 'https://via.placeholder.com/48'} 
              alt={author?.displayName} 
              className="author-photo"
            />
            <div className="author-info">
              <span className="author-name">{author?.displayName || author?.email}</span>
              <span className="recipe-date">
                {recipe.createdAt?.toDate().toLocaleDateString()}
              </span>
            </div>
          </div>

          <div className="recipe-stats">
            <div className="stat">
              <AiOutlineClockCircle size={20} />
              <span>{recipe.cookingTime} mins</span>
            </div>
            <div className="stat">
              <IoMdPeople size={20} />
              <span>{recipe.servings} servings</span>
            </div>
            <button 
              className={`like-button ${isLiked ? 'liked' : ''}`}
              onClick={handleLike}
            >
              {isLiked ? <AiFillHeart size={20} /> : <AiOutlineHeart size={20} />}
              <span>{recipe.likes?.length || 0}</span>
            </button>
          </div>

          <div className="recipe-ingredients">
            <h2>Ingredients</h2>
            <ul>
              {recipe.ingredients.map((ingredient, index) => (
                <li key={index}>{ingredient}</li>
              ))}
            </ul>
          </div>

          <div className="recipe-instructions">
            <h2>Instructions</h2>
            <ol>
              {recipe.instructions.map((step, index) => (
                <li key={index}>{step}</li>
              ))}
            </ol>
          </div>
        </div>

        <div className="recipe-comments">
          <h2>Comments ({recipe.comments?.length || 0})</h2>
          
          <form onSubmit={handleComment} className="comment-form">
            <input
              type="text"
              className="comment-input"
              placeholder="Add a comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
            />
            <button type="submit" className="comment-button">
              Comment
            </button>
          </form>

          <div className="comments-list">
            {recipe.comments?.sort((a, b) => b.timestamp - a.timestamp).map((comment, index) => (
              <div key={index} className="comment">
                <img
                  src="https://via.placeholder.com/40"
                  alt={comment.userName}
                  className="comment-author-photo"
                />
                <div className="comment-content">
                  <div className="comment-header">
                    <span className="comment-author">{comment.userName}</span>
                    <span className="comment-time">
                      {comment.timestamp.toDate().toLocaleDateString()}
                    </span>
                  </div>
                  <p className="comment-text">{comment.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecipeDetail; 