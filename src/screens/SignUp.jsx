import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, googleProvider } from '../firebase';
import { createUserWithEmailAndPassword, signInWithPopup } from 'firebase/auth';

const SignUp = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      // On successful sign-up, navigate to homepage
      navigate('/homepage');
    } catch (error) {
      setError('Failed to create account. Please try again.');
      console.error('Sign-up error:', error);
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      navigate('/homepage');
    } catch (error) {
      setError('Failed to sign up with Google.');
      console.error('Google sign-up error:', error);
    }
  };

  return (
    <div className="app">
      <div className="container">
        <h1 className="title">Cooking App</h1>
        <p className="subtitle">Discover delicious recipes and cook with passion!</p>
      </div>
      <div className="card">
        <h2>Create Account</h2>
        {error && <p className="error">{error}</p>}
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            className="input"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
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
            Sign Up
          </button>
        </form>

        <button onClick={handleGoogleSignUp} className="button google-button">
          <img
            src="https://www.google.com/favicon.ico"
            alt="Google Icon"
            style={{ width: '20px', marginRight: '10px' }}
          />
          Sign up with Google
        </button>

        <p className="mt-1 text-center">
          Already have an account?{' '}
          <span className="link" onClick={() => navigate('/')}>
            Sign In
          </span>
        </p>
      </div>
    </div>
  );
};

export default SignUp; 