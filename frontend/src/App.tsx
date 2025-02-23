import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import EventForm from './components/CreateEvent'
import EventDetails from './components/EventDetails'
import HomePage from './components/HomePage';
import Navbar from './components/Navbar';
import Events from './components/Events';
import { AnimatePresence } from 'framer-motion';
import { SocketProvider } from './context/SocketContext';
import { AuthProvider } from './context/AuthContext';
import Auth from './components/Auth';
import ProtectedRoute from './components/ProtectedRoute';
import Profile from './components/Profile';
import { Toaster } from 'react-hot-toast';
import './scrollbar.css';

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <Router future={{ v7_relativeSplatPath: true }}>
          <Toaster
            position="top-center"
            toastOptions={{
              style: {
                background: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: '#1F2937',
              },
              success: {
                iconTheme: {
                  primary: '#aa33ff',
                  secondary: '#ffffff',
                },
              },
              error: {
                iconTheme: {
                  primary: '#EF4444',
                  secondary: 'white',
                },
              },
            }}
            gutter={8}
            containerStyle={{
              top: 52,
            }}
            containerClassName="toast-container"
            reverseOrder={false}
          />
          <Navbar />
          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route
                path="/create-event"
                element={
                  <ProtectedRoute>
                    <EventForm />
                  </ProtectedRoute>
                }
              />
              <Route path="/auth" element={<Auth />} />
              <Route path="/events" element={<Events />} />
              <Route path="/events/:id" element={<EventDetails />} />
              <Route path="/profile" element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } />
            </Routes>
          </AnimatePresence>
        </Router>
      </SocketProvider>
    </AuthProvider>
  )
}

export default App
