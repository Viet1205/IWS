import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, googleProvider } from '../firebase';
import { signInWithEmailAndPassword, signInWithPopup, sendPasswordResetEmail } from 'firebase/auth';

const SignIn = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  const [showResetForm, setShowResetForm] = useState(false);
  const [resetMessage, setResetMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/homepage');
    } catch (error) {
      setError('Failed to sign in. Please check your credentials.');
      console.error('Sign-in error:', error);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      navigate('/homepage');
    } catch (error) {
      setError('Failed to sign in with Google.');
      console.error('Google sign-in error:', error);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    try {
      await sendPasswordResetEmail(auth, resetEmail);
      setResetMessage('Password reset email sent! Check your inbox.');
      setError('');
      // Hide the reset form after successful send
      setTimeout(() => {
        setShowResetForm(false);
        setResetMessage('');
      }, 3000);
    } catch (error) {
      setError('Failed to send reset email. Please check your email address.');
      console.error('Reset password error:', error);
    }
  };

  return (
    <div className="app">
      <div className="container">
        <h1 className="title">Cooking App</h1>
        <p className="subtitle">Discover delicious recipes and cook with passion!</p>
      </div>
      <div className="card">
        <h2>Sign In</h2>
        {error && <p className="error">{error}</p>}
        {resetMessage && <p className="success">{resetMessage}</p>}
        
        {!showResetForm ? (
          <>
            <form onSubmit={handleSubmit}>
              <input
                type="email"
                className="input"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <input
                type="password"
                className="input"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button type="submit" className="button primary-button">
                Sign In
              </button>
            </form>

            <button onClick={handleGoogleSignIn} className="button google-button">
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
                onClick={() => setShowResetForm(true)}
                style={{ cursor: 'pointer' }}
              >
                Forgot Password?
              </span>
            </p>
          </>
        ) : (
          <form onSubmit={handleForgotPassword}>
            <p>Enter your email to receive a password reset link:</p>
            <input
              type="email"
              className="input"
              placeholder="Email"
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              required
            />
            <button type="submit" className="button primary-button">
              Send Reset Link
            </button>
            <button
              type="button"
              className="button"
              onClick={() => setShowResetForm(false)}
              style={{ marginTop: '10px', background: '#666' }}
            >
              Back to Sign In
            </button>
          </form>
        )}

        <p className="mt-1 text-center">
          Don't have an account?{' '}
          <span className="link" onClick={() => navigate('/signup')}>
            Sign Up
          </span>
        </p>
      </div>
    </div>
  );
};

export default SignIn; 