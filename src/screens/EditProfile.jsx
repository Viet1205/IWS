import React, { useState } from 'react';
import { auth } from '../firebase';
import '../styles/EditProfile.css';

function EditProfile({ userInfo, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    displayName: userInfo.displayName || '',
    email: userInfo.email || '',
    bio: userInfo.bio || '',
    photoURL: userInfo.photoURL || '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prevState => ({
          ...prevState,
          photoURL: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="edit-profile-container">
      <div className="edit-profile-header">
        <h2>Edit Profile</h2>
      </div>
      
      <form onSubmit={handleSubmit} className="edit-profile-form">
        <div className="profile-photo-section">
          <img 
            src={formData.photoURL} 
            alt="Profile" 
            className="profile-photo-preview"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "https://th.bing.com/th/id/OIP.YPe5zNjdWy-GukFdseuXbQHaHa?w=203&h=203&c=7&r=0&o=5&dpr=1.3&pid=1.7";
            }}
          />
          <div className="photo-upload">
            <label htmlFor="photo-upload" className="upload-button">
              Change Photo
            </label>
            <input
              type="file"
              id="photo-upload"
              accept="image/*"
              onChange={handlePhotoChange}
              style={{ display: 'none' }}
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="displayName">Display Name</label>
          <input
            type="text"
            id="displayName"
            name="displayName"
            value={formData.displayName}
            onChange={handleChange}
            placeholder="Enter your display name"
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter your email"
            disabled={auth.currentUser?.providerData[0]?.providerId === 'google.com'}
          />
        </div>

        <div className="form-group">
          <label htmlFor="bio">Bio</label>
          <textarea
            id="bio"
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            placeholder="Tell us about yourself"
            rows="4"
          />
        </div>

        <div className="form-buttons">
          <button type="button" className="cancel-button" onClick={onCancel}>
            Cancel
          </button>
          <button type="submit" className="save-button">
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}

export default EditProfile; 