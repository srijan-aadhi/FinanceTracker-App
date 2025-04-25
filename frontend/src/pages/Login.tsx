import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    const usersJSON = localStorage.getItem('users');
    const users = usersJSON ? JSON.parse(usersJSON) : [];

    const userExists = users.find(
      (user: any) => user.email === email && user.password === password
    );

    if (userExists) {
      localStorage.setItem('accessToken', 'mock-token');
      navigate('/dashboard');
    } else {
      setError('Account not found. Please create an account.');
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'black',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        color: 'limegreen',
      }}
    >
      <div
        style={{
          backgroundColor: '#111',
          padding: '30px',
          borderRadius: '10px',
          width: '100%',
          maxWidth: '400px',
          boxShadow: '0 0 15px limegreen',
        }}
      >
        <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Sign in</h2>
        <form onSubmit={handleLogin}>
          <input
            type="email"
            required
            placeholder="Email Address*"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              width: '100%',
              padding: '10px',
              marginBottom: '10px',
              border: '1px solid limegreen',
              background: '#000',
              color: 'limegreen',
            }}
          />
          <input
            type="password"
            required
            placeholder="Password*"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              width: '100%',
              padding: '10px',
              marginBottom: '10px',
              border: '1px solid limegreen',
              background: '#000',
              color: 'limegreen',
            }}
          />
          {error && <p style={{ color: 'red' }}>{error}</p>}

          <button
            type="submit"
            style={{
              width: '100%',
              padding: '10px',
              backgroundColor: 'limegreen',
              color: 'black',
              fontWeight: 'bold',
              border: 'none',
              marginBottom: '10px',
              cursor: 'pointer',
            }}
          >
            Sign In
          </button>

          <div style={{ textAlign: 'right' }}>
            <Link to="/forgot-password" style={{ color: 'lightgreen', fontSize: '0.9rem' }}>
              Forgot Password?
            </Link>
          </div>
        </form>

        <div style={{ marginTop: '15px', textAlign: 'center' }}>
          <Link to="/register" style={{ color: 'lightgreen' }}>
            Don't have an account? Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
