import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, googleProvider } from '../firebase';
import { signInWithEmailAndPassword, signInWithPopup, sendPasswordResetEmail } from 'firebase/auth';

const SignIn = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    resetEmail: ''
  });
  const [errors, setErrors] = useState({});
  const [showResetForm, setShowResetForm] = useState(false);
  const [resetMessage, setResetMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockTimer, setLockTimer] = useState(0);

  // Handle account lockout
  useEffect(() => {
    let timer;
    if (isLocked && lockTimer > 0) {
      timer = setInterval(() => {
        setLockTimer(prev => {
          if (prev <= 1) {
            setIsLocked(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isLocked, lockTimer]);

  const handleLockout = () => {
    setAttemptCount(prev => prev + 1);
    if (attemptCount >= 4) { // Lock after 5 attempts
      setIsLocked(true);
      setLockTimer(300); // 5 minutes lockout
      setErrors(prev => ({
        ...prev,
        submit: `Account temporarily locked. Please try again in ${Math.ceil(lockTimer/60)} minutes or reset your password.`
      }));
      return true;
    }
    return false;
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      return 'Email is required';
    }
    if (!emailRegex.test(email)) {
      return 'Please enter a valid email address';
    }
    return '';
  };

  const validatePassword = (password) => {
    if (!password) {
      return 'Password is required';
    }
    if (password.length < 6) {
      return 'Password must be at least 6 characters';
    }
    return '';
  };

  const validateForm = () => {
    const newErrors = {};
    
    const emailError = validateEmail(formData.email);
    if (emailError) newErrors.email = emailError;

    const passwordError = validatePassword(formData.password);
    if (passwordError) newErrors.password = passwordError;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateResetEmail = () => {
    const newErrors = {};
    const emailError = validateEmail(formData.resetEmail);
    if (emailError) {
      newErrors.resetEmail = emailError;
      setErrors(newErrors);
      return false;
    }
    return true;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value.trim()
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSignInError = (error) => {
    console.error('Sign-in error:', error);
    
    // Clear previous errors
    setErrors(prev => ({
      ...prev,
      email: '',
      password: '',
      submit: ''
    }));

    // Check for lockout first
    if (handleLockout()) {
      return;
    }

    // Handle offline/network errors
    if (!navigator.onLine) {
      setErrors(prev => ({
        ...prev,
        submit: 'No internet connection. Please check your network and try again.'
      }));
      return;
    }

    // Extract error message from Firebase error
    const errorCode = error?.code || '';
    const errorMessage = error?.message || '';

    // Email-related errors
    if (errorMessage.includes('user-not-found') || errorCode === 'auth/user-not-found') {
      setErrors(prev => ({
        ...prev,
        email: 'This email is not registered. Please check your email or sign up for a new account.'
      }));
      return;
    }

    if (errorMessage.includes('invalid-email') || errorCode === 'auth/invalid-email') {
      setErrors(prev => ({
        ...prev,
        email: 'Invalid email format. Please enter a valid email address.'
      }));
      return;
    }

    // Password-related errors
    if (errorMessage.includes('wrong-password') || errorCode === 'auth/wrong-password') {
      setErrors(prev => ({
        ...prev,
        password: 'Incorrect password. Please try again.'
      }));
      return;
    }

    // Account status errors
    if (errorMessage.includes('user-disabled') || errorCode === 'auth/user-disabled') {
      setErrors(prev => ({
        ...prev,
        submit: 'This account has been disabled. Please contact support.'
      }));
      return;
    }

    // Rate limiting errors
    if (errorMessage.includes('too-many-requests') || errorCode === 'auth/too-many-requests') {
      setIsLocked(true);
      setLockTimer(300); // 5 minutes
      setErrors(prev => ({
        ...prev,
        submit: 'Too many failed attempts. Please try again in 5 minutes or reset your password.'
      }));
      return;
    }

    // Network errors
    if (errorMessage.includes('network') || errorCode === 'auth/network-request-failed') {
      setErrors(prev => ({
        ...prev,
        submit: 'Network error. Please check your internet connection and try again.'
      }));
      return;
    }

    // Default error
    setErrors(prev => ({
      ...prev,
      submit: 'An error occurred during sign in. Please try again.'
    }));
  };

  const handleGoogleError = (error) => {
    console.error('Google sign-in error:', error);

    // Clear previous errors
    setErrors(prev => ({
      ...prev,
      submit: ''
    }));

    // Handle offline/network errors
    if (!navigator.onLine) {
      setErrors(prev => ({
        ...prev,
        submit: 'No internet connection. Please check your network and try again.'
      }));
      return;
    }

    const errorCode = error?.code || '';
    const errorMessage = error?.message || '';

    if (errorMessage.includes('popup-closed') || errorCode === 'auth/popup-closed-by-user') {
      setErrors(prev => ({
        ...prev,
        submit: 'Sign in cancelled. Please try again.'
      }));
      return;
    }

    if (errorMessage.includes('popup-blocked') || errorCode === 'auth/popup-blocked') {
      setErrors(prev => ({
        ...prev,
        submit: 'Pop-up was blocked. Please enable pop-ups and try again.'
      }));
      return;
    }

    if (errorMessage.includes('account-exists') || errorCode === 'auth/account-exists-with-different-credential') {
      setErrors(prev => ({
        ...prev,
        submit: 'An account already exists with this email but with different sign-in credentials.'
      }));
      return;
    }

    // Default error
    setErrors(prev => ({
      ...prev,
      submit: 'Failed to sign in with Google. Please try again.'
    }));
  };

  const handleResetError = (error) => {
    console.error('Reset password error:', error);

    // Clear previous errors
    setErrors(prev => ({
      ...prev,
      resetEmail: ''
    }));

    // Handle offline/network errors
    if (!navigator.onLine) {
      setErrors(prev => ({
        ...prev,
        resetEmail: 'No internet connection. Please check your network and try again.'
      }));
      return;
    }

    const errorCode = error?.code || '';
    const errorMessage = error?.message || '';

    if (errorMessage.includes('user-not-found') || errorCode === 'auth/user-not-found') {
      setErrors(prev => ({
        ...prev,
        resetEmail: 'No account found with this email. Please check the email or sign up.'
      }));
      return;
    }

    if (errorMessage.includes('invalid-email') || errorCode === 'auth/invalid-email') {
      setErrors(prev => ({
        ...prev,
        resetEmail: 'Invalid email format. Please enter a valid email address.'
      }));
      return;
    }

    if (errorMessage.includes('too-many-requests') || errorCode === 'auth/too-many-requests') {
      setErrors(prev => ({
        ...prev,
        resetEmail: 'Too many requests. Please try again in a few minutes.'
      }));
      return;
    }

    // Default error
    setErrors(prev => ({
      ...prev,
      resetEmail: 'Failed to send reset email. Please try again.'
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (isLocked) {
      setErrors(prev => ({
        ...prev,
        submit: `Account temporarily locked. Please try again in ${Math.ceil(lockTimer/60)} minutes or reset your password.`
      }));
      return;
    }

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await signInWithEmailAndPassword(auth, formData.email, formData.password);
      setAttemptCount(0);
      navigate('/homepage');
    } catch (error) {
      handleSignInError(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (isLocked) {
      setErrors(prev => ({
        ...prev,
        submit: `Account temporarily locked. Please try again in ${Math.ceil(lockTimer/60)} minutes.`
      }));
      return;
    }

    setIsSubmitting(true);
    try {
      await signInWithPopup(auth, googleProvider);
      setAttemptCount(0);
      navigate('/homepage');
    } catch (error) {
      handleGoogleError(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    
    if (!validateResetEmail()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await sendPasswordResetEmail(auth, formData.resetEmail);
      setResetMessage('Password reset email sent! Please check your inbox and spam folder.');
      setErrors({});
      setAttemptCount(0);
      
      setTimeout(() => {
        setShowResetForm(false);
        setResetMessage('');
        setFormData(prev => ({ ...prev, resetEmail: '' }));
      }, 5000);
    } catch (error) {
      handleResetError(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleShowResetForm = () => {
    setShowResetForm(true);
    setErrors({});
    setFormData(prev => ({ ...prev, resetEmail: '' }));
  };

  return (
    <div className="app">
      <div className="container">
        <h1 className="title">Cooking App</h1>
        <p className="subtitle">Discover delicious recipes and cook with passion!</p>
      </div>
      <div className="card">
        <h2>Sign In</h2>
        {errors.submit && <p className="error">{errors.submit}</p>}
        {resetMessage && <p className="success">{resetMessage}</p>}
        
        {!showResetForm ? (
          <>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <input
                  type="email"
                  name="email"
                  className={`input ${errors.email ? 'input-error' : ''}`}
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={isSubmitting || isLocked}
                  required
                />
                {errors.email && (
                  <div className="error-container">
                    <p className="error-text">{errors.email}</p>
                    {errors.email.includes('not registered') && (
                      <button
                        type="button"
                        className="link-button"
                        onClick={() => navigate('/signup')}
                        disabled={isSubmitting}
                      >
                        Sign up now
                      </button>
                    )}
                  </div>
                )}
              </div>

              <div className="form-group">
                <input
                  type="password"
                  name="password"
                  className={`input ${errors.password ? 'input-error' : ''}`}
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={isSubmitting || isLocked}
                  required
                />
                {errors.password && (
                  <div className="error-container">
                    <p className="error-text">{errors.password}</p>
                    <button
                      type="button"
                      className="link-button"
                      onClick={handleShowResetForm}
                      disabled={isSubmitting}
                    >
                      Reset password
                    </button>
                  </div>
                )}
              </div>

              <button 
                type="submit" 
                className="button primary-button"
                disabled={isSubmitting || isLocked}
              >
                {isSubmitting ? 'Signing In...' : isLocked ? `Try again in ${Math.ceil(lockTimer/60)}m` : 'Sign In'}
              </button>
            </form>

            <button 
              onClick={handleGoogleSignIn} 
              className="button google-button"
              disabled={isSubmitting || isLocked}
            >
              <img
                src="https://www.google.com/favicon.ico"
                alt="Google Icon"
                style={{ width: '20px', marginRight: '10px' }}
              />
              Sign in with Google
            </button>

            <p className="mt-1 text-center">
              <span 
                className="link" 
                onClick={() => !isSubmitting && !isLocked && handleShowResetForm()}
                style={{ cursor: isSubmitting || isLocked ? 'not-allowed' : 'pointer' }}
              >
                Forgot Password?
              </span>
            </p>
          </>
        ) : (
          <form onSubmit={handleForgotPassword}>
            <p>Enter your email to receive a password reset link:</p>
            <div className="form-group">
              <input
                type="email"
                name="resetEmail"
                className={`input ${errors.resetEmail ? 'input-error' : ''}`}
                placeholder="Email"
                value={formData.resetEmail}
                onChange={handleChange}
                disabled={isSubmitting}
                required
              />
              {errors.resetEmail && (
                <div className="error-container">
                  <p className="error-text">{errors.resetEmail}</p>
                  {errors.resetEmail.includes('No account found') && (
                    <button
                      type="button"
                      className="link-button"
                      onClick={() => navigate('/signup')}
                      disabled={isSubmitting}
                    >
                      Sign up now
                    </button>
                  )}
                </div>
              )}
            </div>

            <button 
              type="submit" 
              className="button primary-button"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Sending...' : 'Send Reset Link'}
            </button>
            
            <button
              type="button"
              className="button"
              onClick={() => !isSubmitting && setShowResetForm(false)}
              style={{ marginTop: '10px', background: '#666' }}
              disabled={isSubmitting}
            >
              Back to Sign In
            </button>
          </form>
        )}

        <p className="mt-1 text-center">
          Don't have an account?{' '}
          <span 
            className="link" 
            onClick={() => !isSubmitting && navigate('/signup')}
            style={{ cursor: isSubmitting ? 'not-allowed' : 'pointer' }}
          >
            Sign Up
          </span>
        </p>
      </div>
    </div>
  );
};

export default SignIn; 