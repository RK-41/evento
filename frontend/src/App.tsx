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

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <Router future={{ v7_relativeSplatPath: true }}>
          <Navbar />
          <AnimatePresence mode="wait">
            <div className="pt-8">
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
