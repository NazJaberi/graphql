import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';

function Login() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      console.log('Attempting login...');
      const credentials = btoa(`${identifier}:${password}`);
      const response = await fetch('https://learn.reboot01.com/api/auth/signin', {
        method: 'POST',
        headers: {
          Authorization: `Basic ${credentials}`,
        },
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        throw new Error('Invalid credentials');
      }

      const data = await response.json();
      console.log('Response data:', data); // Log the entire response data

      // Check the actual structure of your response
      const token = data.token || data.jwt || data; // Try different possible token locations

      if (!token) {
        throw new Error('No token in response');
      }

      // Show JWT token in console
      console.log('%cJWT token:', 'color: #10B981; font-weight: bold;', token);

      // Use the AuthContext login method
      login(token);

      // Add a small delay before navigation
      setTimeout(() => {
        navigate('/', { replace: true });
      }, 200);
    } catch (err) {
      console.error('Login error:', err);
      setError('Login failed. Please check your credentials.');
    }
  };

  return (
    <div style={styles.root}>
      <div style={styles.loginCard}>
        <h2 style={styles.title}>Sign in</h2>

        {error && <div style={styles.errorMsg}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div style={styles.inputGroup}>
            <input
              type="text"
              style={styles.input}
              placeholder="Username or Email"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
            />
          </div>
          <div style={styles.inputGroup}>
            <input
              type="password"
              style={styles.input}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" style={styles.submitButton}>
            Sign in
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  root: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    // Gradient background similar to previously used color scheme
    background: 'linear-gradient(120deg, #6b21a8, #6366F1)',
    padding: '1rem',
  },
  loginCard: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
    border: '1px solid #e2e8f0',
    maxWidth: '400px',
    width: '100%',
    padding: '2rem',
  },
  title: {
    textAlign: 'center',
    margin: '0 0 1rem',
    fontSize: '1.5rem',
    color: '#1e293b',
  },
  errorMsg: {
    color: '#ef4444',
    marginBottom: '1rem',
    textAlign: 'center',
    fontSize: '0.95rem',
  },
  inputGroup: {
    marginBottom: '1rem',
  },
  input: {
    width: '100%',
    padding: '0.75rem',
    border: '1px solid #cbd5e1',
    borderRadius: '8px',
    fontSize: '1rem',
  },
  submitButton: {
    width: '100%',
    padding: '0.75rem',
    background: 'linear-gradient(90deg, #ef4444, #ec4899)',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: 'bold',
  },
};

export default Login;