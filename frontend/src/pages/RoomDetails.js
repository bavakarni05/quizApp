import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Container, Typography, Paper, CircularProgress, List, ListItem, ListItemText } from '@mui/material';
import axios from 'axios';

const RoomDetails = () => {
  const { roomId } = useParams();
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/rooms/${roomId}`);
        setRoom(res.data);
      } catch (err) {
        setError('Room not found');
      }
      setLoading(false);
    };
    fetchRoom();
  }, [roomId]);

  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress color="success" />
      </Box>
    );
  }

  if (error || !room) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Paper sx={{ p: 4, textAlign: 'center', color: '#ff0000', background: 'rgba(0,0,0,0.5)' }}>
          {error || 'Room not found'}
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', background: 'linear-gradient(45deg, #1a1a1a 30%, #2d2d2d 90%)', py: 8 }}>
      <Container maxWidth="md">
        <Typography variant="h4" align="center" sx={{ color: '#00ff00', mb: 4 }}>
          Room Details
        </Typography>
        <Paper sx={{ p: 4, mb: 4, background: 'rgba(0,0,0,0.5)', color: '#00ff00' }}>
          <Typography variant="h6">Room Code: {room.roomCode}</Typography>
          <Typography>Status: {room.status}</Typography>
          <Typography>Number of Players: {room.players ? room.players.length : 0}</Typography>
          <Typography>Host: {room.host && room.host.username ? room.host.username : 'N/A'}</Typography>
        </Paper>
        <Typography variant="h5" sx={{ color: '#00ff00', mb: 2 }}>Players</Typography>
        <List>
          {room.players && room.players.length > 0 ? (
            room.players.map((player) => (
              <ListItem key={player._id} divider>
                <ListItemText
                  primary={player.username}
                  secondary={`Score: ${player.score || 0}`}
                />
              </ListItem>
            ))
          ) : (
            <ListItem>
              <ListItemText primary="No players joined yet." />
            </ListItem>
          )}
        </List>
        {room.status === 'completed' && room.players && room.players.length > 0 && (
          <>
            <Typography variant="h5" sx={{ color: '#00ff00', mt: 4, mb: 2 }}>Leaderboard</Typography>
            <List>
              {[...room.players]
                .sort((a, b) => (b.score || 0) - (a.score || 0))
                .map((player, idx) => (
                  <ListItem key={player._id} divider>
                    <ListItemText
                      primary={`#${idx + 1} ${player.username}`}
                      secondary={`Score: ${player.score || 0}`}
                    />
                  </ListItem>
                ))}
            </List>
          </>
        )}
      </Container>
    </Box>
  );
};

export default RoomDetails; 