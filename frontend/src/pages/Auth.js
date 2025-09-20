import React, { useState } from 'react';
import { Box, Container, Typography, TextField, Button, Paper, ToggleButton, ToggleButtonGroup } from '@mui/material';
import styled from 'styled-components';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
//comment
const StyledPaper = styled(Paper)`
  padding: 2rem;
  background: linear-gradient(45deg, #2d2d2d 30%, #1a1a1a 90%);
  border: 2px solid #00ff00;
  box-shadow: 0 0 20px rgba(0, 255, 0, 0.3);
  max-width: 400px;
  margin: 0 auto;
`;

const Auth = () => {
  const [role, setRole] = useState('host');
  const [mode, setMode] = useState('login'); // 'login' or 'signup'
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRoleChange = (event, newRole) => {
    if (newRole) setRole(newRole);
  };

  const handleModeToggle = () => {
    setMode(mode === 'login' ? 'signup' : 'login');
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const endpoint = mode === 'login' ? '/api/users/login' : '/api/users/signup';
      const res = await axios.post(`https://quizzverse-cv88.onrender.com${endpoint}`, {
        username,
        password,
        role,
      });
      setSuccess(res.data.message || (mode === 'login' ? 'Login successful!' : 'Signup successful!'));
      if (res.data.token) {
        localStorage.setItem('token', res.data.token);
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred');
    }
    setLoading(false);
  };

  return (
    <Box sx={{ minHeight: '100vh', background: 'linear-gradient(45deg, #1a1a1a 30%, #2d2d2d 90%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Container maxWidth="sm">
        <StyledPaper>
          <Typography variant="h4" align="center" sx={{ color: '#00ff00', mb: 2 }}>
            {mode === 'login' ? 'Login' : 'Sign Up'}
          </Typography>
          <ToggleButtonGroup
            color="primary"
            value={role}
            exclusive
            onChange={handleRoleChange}
            fullWidth
            sx={{ mb: 2 }}
          >
            <ToggleButton value="host">Host</ToggleButton>
            <ToggleButton value="player">Player</ToggleButton>
          </ToggleButtonGroup>
          <form onSubmit={handleSubmit}>
            <TextField
              label="Username"
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              fullWidth
              required
              sx={{ mb: 2 }}
            />
            <TextField
              label="Password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              fullWidth
              required
              sx={{ mb: 2 }}
            />
            {error && <Typography color="error" sx={{ mb: 1 }}>{error}</Typography>}
            {success && <Typography color="success.main" sx={{ mb: 1 }}>{success}</Typography>}
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              disabled={loading}
              sx={{ mt: 1, mb: 1, background: 'linear-gradient(45deg, #00ff00 30%, #00cc00 90%)', color: '#000' }}
            >
              {loading ? (mode === 'login' ? 'Logging in...' : 'Signing up...') : (mode === 'login' ? 'Login' : 'Sign Up')}
            </Button>
          </form>
          <Button onClick={handleModeToggle} color="secondary" fullWidth sx={{ mt: 1 }}>
            {mode === 'login' ? "Don't have an account? Sign Up" : 'Already have an account? Login'}
          </Button>
        </StyledPaper>
      </Container>
    </Box>
  );
};

export default Auth; 