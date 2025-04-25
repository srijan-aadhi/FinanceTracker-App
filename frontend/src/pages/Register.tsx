import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();

    const usersJSON = localStorage.getItem('users');
    const users = usersJSON ? JSON.parse(usersJSON) : [];

    const userExists = users.find((user: any) => user.email === email);

    if (userExists) {
      setError('Account already exists. Please log in.');
      return;
    }

    users.push({ email, password });
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('accessToken', 'mock-token');

    navigate('/dashboard');
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
        <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Sign up</h2>
        <form onSubmit={handleRegister}>
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
            Sign Up
          </button>
        </form>

        <div style={{ marginTop: '15px', textAlign: 'center' }}>
          <Link to="/login" style={{ color: 'lightgreen' }}>
            Already have an account? Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
