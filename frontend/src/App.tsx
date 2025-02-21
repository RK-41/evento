import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import EventForm from './components/EventForm'
import EventDetails from './components/EventDetails'
import HomePage from './components/HomePage';
import Navbar from './components/Navbar';
import Events from './components/Events';
import { AnimatePresence } from 'framer-motion';
import { SocketProvider } from './context/SocketContext';
import { AuthProvider } from './context/AuthContext';
import Login from './components/Login';
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
                  primary: '#6366F1',
                  secondary: 'white',
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
              top: 48,
            }}
            containerClassName="toast-container"
            reverseOrder={false}
          />
          <Navbar />
          <AnimatePresence mode="wait">
            <div>
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
                <Route path="/login" element={<Login />} />
                <Route path="/events" element={<Events />} />
                <Route path="/events/:id" element={<EventDetails />} />
                <Route path="/profile" element={<Profile />} />
              </Routes>
            </div>
          </AnimatePresence>
        </Router>
      </SocketProvider>
    </AuthProvider>
  )
}

export default App
