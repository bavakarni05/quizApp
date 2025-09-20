import React, { useEffect, useState } from 'react';
import { Box, Container, Typography, Paper, CircularProgress, List, ListItem, ListItemText } from '@mui/material';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
//comment
const UserRooms = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState(null);
  const [username, setUsername] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Decode JWT to get role and username
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const decoded = jwtDecode(token);
        setRole(decoded.role);
        setUsername(decoded.username);
        // Fetch rooms from backend based on role and username
        const fetchRooms = async () => {
          try {
            let url = '';
            if (decoded.role === 'host') {
              url = `https://quizzverse-cv88.onrender.com/api/rooms/host/${decoded.username}`;
            } else if (decoded.role === 'player') {
              url = `https://quizzverse-cv88.onrender.com/api/rooms/player/${decoded.username}`;
            }
            if (url) {
              const res = await axios.get(url);
              setRooms(res.data);
            } else {
              setRooms([]);
            }
          } catch (err) {
            setRooms([]);
          }
          setLoading(false);
        };
        fetchRooms();
      }
    } catch (e) {
      setRole(null);
      setLoading(false);
    }
  }, []);

  let title = '';
  let emptyMsg = '';
  if (role === 'host') {
    title = 'My Rooms';
    emptyMsg = 'You have not created any rooms yet.';
  } else if (role === 'player') {
    title = 'Joined Rooms';
    emptyMsg = 'You have not joined any rooms yet.';
  }

  return (
    <Box sx={{ minHeight: '100vh', background: 'linear-gradient(45deg, #1a1a1a 30%, #2d2d2d 90%)', py: 8 }}>
      <Container maxWidth="md">
        <Typography variant="h4" align="center" sx={{ color: '#00ff00', mb: 4 }}>
          {title}
        </Typography>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <CircularProgress color="success" />
          </Box>
        ) : rooms.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center', color: '#00ff00', background: 'rgba(0,0,0,0.5)' }}>
            {emptyMsg}
          </Paper>
        ) : (
          <List>
            {rooms.map((room) => (
              <ListItem
                key={room._id}
                divider
                button
                onClick={() => navigate(`/leaderboard/${room._id}`)}
                sx={{ cursor: 'pointer' }}
              >
                <ListItemText
                  primary={`Quiz Name: ${room.quizName}`}
                  secondary={`Status: ${room.status}`}
                />
              </ListItem>
            ))}
          </List>
        )}
      </Container>
    </Box>
  );
};

export default UserRooms; 