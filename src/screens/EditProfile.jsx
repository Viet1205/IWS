import React, { useState } from 'react';
import { auth, storage } from '../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import '../styles/EditProfile.css';

function EditProfile({ userInfo, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    displayName: userInfo.displayName || '',
    email: userInfo.email || '',
    bio: userInfo.bio || '',
    photoURL: userInfo.photoURL || '',
  });
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewURL, setPreviewURL] = useState(userInfo.photoURL || '');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB');
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
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
        
        setSelectedFile(file);
        setPreviewURL(compressedImage);
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isUploading) return;

    try {
      setIsUploading(true);

      let finalPhotoURL = formData.photoURL;

      // If there's a new photo selected, upload it first
      if (selectedFile) {
        try {
          const user = auth.currentUser;
          if (!user) {
            throw new Error('No authenticated user found');
          }

          // Convert the file to base64
          const reader = new FileReader();
          const base64Promise = new Promise((resolve, reject) => {
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
          });
          reader.readAsDataURL(selectedFile);
          const base64Image = await base64Promise;

          // Create an image element for compression
          const img = new Image();
          const imgPromise = new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
          });
          img.src = base64Image;
          await imgPromise;

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
          finalPhotoURL = canvas.toDataURL('image/jpeg', 0.7);
        } catch (uploadError) {
          console.error('Error processing photo:', uploadError);
          alert('Failed to process photo. Please try again.');
          setIsUploading(false);
          return;
        }
      }

      // Call onSave with all updated data including the new photo URL if changed
      await onSave({
        ...formData,
        photoURL: finalPhotoURL
      });

      // Reset selected file after successful save
      setSelectedFile(null);
      setIsUploading(false);
    } catch (error) {
      console.error('Error saving profile:', error);
      alert(error.message || 'Failed to save changes. Please try again.');
      setIsUploading(false);
    }
  };

  const handleCancel = () => {
    // Reset preview and selected file
    setSelectedFile(null);
    setPreviewURL(userInfo.photoURL || '');
    onCancel();
  };

  return (
    <div className="edit-profile-container">
      <div className="edit-profile-header">
        <h2>Edit Profile</h2>
      </div>
      
      <form onSubmit={handleSubmit} className="edit-profile-form">
        <div className="profile-photo-section">
          <img 
            src={previewURL} 
            alt="Profile" 
            className="profile-photo-preview"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "https://th.bing.com/th/id/OIP.YPe5zNjdWy-GukFdseuXbQHaHa?w=203&h=203&c=7&r=0&o=5&dpr=1.3&pid=1.7";
            }}
          />
          <div className="photo-upload">
            <label 
              htmlFor="photo-upload" 
              className={`upload-button ${isUploading ? 'uploading' : ''}`}
            >
              {isUploading ? 'Uploading...' : (selectedFile ? 'Change Photo Again' : 'Change Photo')}
            </label>
            <input
              type="file"
              id="photo-upload"
              accept="image/*"
              onChange={handlePhotoChange}
              disabled={isUploading}
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
            required
            disabled={isUploading}
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
            disabled={auth.currentUser?.providerData[0]?.providerId === 'google.com' || isUploading}
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
            disabled={isUploading}
          />
        </div>

        <div className="form-buttons">
          <button 
            type="button" 
            className="cancel-button" 
            onClick={handleCancel}
            disabled={isUploading}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="save-button"
            disabled={isUploading}
          >
            {isUploading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default EditProfile; 