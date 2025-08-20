import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Home from './pages/Home';
import CreateRoom from './pages/CreateRoom';
import JoinRoom from './pages/JoinRoom';
import WaitingRoom from './pages/WaitingRoom';
import QuizRoom from './pages/QuizRoom';
import Leaderboard from './pages/Leaderboard';
import Auth from './pages/Auth';
import UserRooms from './pages/UserRooms';
import RoomDetails from './pages/RoomDetails';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#00ff00',
    },
    secondary: {
      main: '#ff00ff',
    },
    background: {
      default: '#1a1a1a',
      paper: '#2d2d2d',
    },
  },
  typography: {
    fontFamily: '"Press Start 2P", cursive',
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 0,
          textTransform: 'none',
          fontFamily: '"Press Start 2P", cursive',
        },
      },
    },
  },
});

// Utility to check authentication
const isAuthenticated = () => {
  return !!localStorage.getItem('token');
};

// Wrapper for protected routes
function RequireAuth({ children }) {
  const location = useLocation();
  if (!isAuthenticated()) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }
  return children;
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route
            path="/"
            element={
              <RequireAuth>
                <Home />
              </RequireAuth>
            }
          />
          <Route
            path="/create-room"
            element={
              <RequireAuth>
                <CreateRoom />
              </RequireAuth>
            }
          />
          <Route
            path="/join-room"
            element={
              <RequireAuth>
                <JoinRoom />
              </RequireAuth>
            }
          />
          <Route
            path="/waiting-room/:roomId"
            element={
              <RequireAuth>
                <WaitingRoom />
              </RequireAuth>
            }
          />
          <Route
            path="/quiz-room/:roomId"
            element={
              <RequireAuth>
                <QuizRoom />
              </RequireAuth>
            }
          />
          <Route
            path="/leaderboard/:roomId"
            element={
              <RequireAuth>
                <Leaderboard />
              </RequireAuth>
            }
          />
          <Route
            path="/user-rooms"
            element={
              <RequireAuth>
                <UserRooms />
              </RequireAuth>
            }
          />
          <Route
            path="/room/:roomId"
            element={
              <RequireAuth>
                <RoomDetails />
              </RequireAuth>
            }
          />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
