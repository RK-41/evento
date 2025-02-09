import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

interface NavItem {
  path?: string;
  label: string;
  onClick?: () => void;
}


const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = React.useState<boolean>(false);
  const [isMenuOpen, setIsMenuOpen] = React.useState<boolean>(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const baseNavItems = [
    { path: '/events', label: 'All Events' },
    { path: '/create-event', label: 'Create Event' },
  ];

  const navItems: NavItem[] = [...baseNavItems];

  useEffect(() => {
    setShowDropdown(false);
  }, [user]);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 100 }}
      className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 px-4 py-2 w-full fixed top-0 z-10 h-16"
    >
      {/* Hamburger menu button - visible only on mobile */}
      <button

        title="Menu"
        className="lg:hidden absolute right-16 top-4 text-white z-20 cursor-pointer"
        onClick={() => setIsMenuOpen(!isMenuOpen)}
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {isMenuOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {/* Container for desktop layout */}
      <div className="max-w-7xl mx-auto flex items-center justify-between relative z-10">
        {/* Logo/Brand - always visible */}
        <div className="w-48">
          <Link to="/" className="text-white text-xl font-bold hover:text-yellow-200 transition-colors">
            Evento
          </Link>
        </div>

        {/* Navigation items - centered */}
        <ul className={`
          flex flex-col lg:flex-row items-center
          ${isMenuOpen ? 'flex' : 'hidden'} lg:flex
          lg:items-center
          text-white
          absolute lg:relative
          top-12 lg:top-0
          left-0
          w-full lg:w-auto max-w-80
          lg:bg-transparent
          pb-4 lg:pb-0
          space-y-4 lg:space-y-0
          lg:space-x-12
          rounded-b-lg
          px-4 lg:px-8
          lg:flex-1
          lg:justify-center
          ${isMenuOpen ? 'bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500' : 'bg-transparent'}
        `}>
          {navItems.map((item) => (
            <li key={item.label} className="w-full lg:w-auto mx-auto max-w-40">
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="w-full lg:w-auto"
              >
                <Link
                  to={item.path!}
                  className="hover:text-yellow-200 transition-colors block py-2 px-4 text-center text-lg font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </Link>
              </motion.div>
            </li>
          ))}

          {/* Mobile auth section */}
          <li className="lg:hidden w-full flex justify-center">
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              {user ? (
                <div className="relative">
                  <div
                    className="relative flex items-center cursor-pointer text-white"
                    onClick={() => setShowDropdown(!showDropdown)}
                  >
                    <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center">
                      {user.name?.charAt(0).toUpperCase()}
                    </div>
                    <span className="hover:text-yellow-200 transition-colors block py-2 px-4 text-center text-lg font-medium">
                      {user.name}
                    </span>

                    {/* Dropdown menu */}
                    {showDropdown && (
                      <div className="absolute -right-4 top-full w-32 bg-gradient-to-r from-indigo-600/95 via-purple-600/95 to-pink-500/95 rounded-md shadow-xl z-20 text-center border border-white/20">
                        <Link
                          to="/profile"
                          className="block px-4 py-2 text-white hover:bg-white/20 rounded-t-md transition-colors"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          Profile
                        </Link>
                        <button
                          onClick={() => {
                            handleLogout();
                            setIsMenuOpen(false);
                          }}
                          className="block w-full px-4 py-2 text-white hover:bg-white/20 rounded-b-md cursor-pointer transition-colors"
                        >
                          Logout
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="hover:text-yellow-200 transition-colors block py-2 px-4 text-center text-lg font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Login
                </Link>
              )}
            </motion.div>
          </li>
        </ul>

        {/* Desktop auth section - with fixed width */}
        <div className="hidden lg:block w-48 text-right">
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            {user ? (
              <div className="relative">
                <div
                  className="relative flex items-center justify-end cursor-pointer"
                  onMouseEnter={() => setShowDropdown(true)}
                  onMouseLeave={() => setShowDropdown(false)}
                >
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-white">
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-white hover:text-yellow-200 transition-colors block py-2 px-4 text-center text-lg font-medium">{user.name}</span>

                  {/* Dropdown menu */}
                  {showDropdown && (
                    <div className="absolute -right-2 top-full w-32 bg-gradient-to-r from-indigo-600/95 via-purple-600/95 to-pink-500/95 rounded-md shadow-xl z-20 border border-white/20 text-center">
                      <Link
                        to="/profile"
                        className="block px-4 py-2 text-white hover:bg-white/20 rounded-t-md transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Profile
                      </Link>
                      <button
                        onClick={() => {
                          handleLogout();
                          setIsMenuOpen(false);
                        }}
                        className="block w-full px-4 py-2 text-white hover:bg-white/20 rounded-b-md cursor-pointer transition-colors"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <Link
                to="/login"
                className="text-white hover:text-yellow-200 transition-colors block py-2 px-4 text-center text-lg font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Login
              </Link>
            )}
          </motion.div>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar; 