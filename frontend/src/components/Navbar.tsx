import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
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
      className="bg-gradient-to-r from-indigo-700 via-purple-700 to-pink-700 backdrop-blur-sm px-4 py-2 fixed top-0 z-10 h-16 mx-4 my-2 left-0 right-0 rounded-xl shadow-xl shadow-black/40"
    >
      {/* Hamburger menu button - visible only on mobile */}
      <button
        title="Menu"
        className="md:hidden absolute right-4 top-5 text-white z-20 cursor-pointer"
        onClick={() => setIsMenuOpen(!isMenuOpen)}
      >
        <motion.svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          animate={{ rotate: isMenuOpen ? 90 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.path
            initial={false}
            animate={{
              d: isMenuOpen
                ? "M6 18L18 6M6 6l12 12"
                : "M4 6h16M4 12h16M4 18h16"
            }}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            transition={{ duration: 0.2 }}
          />
        </motion.svg>
      </button>

      {/* Container for desktop layout */}
      <div className="max-w-full mx-auto h-full flex items-center justify-between relative z-10">
        {/* Logo/Brand - always visible */}
        <motion.div
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 1 }}
        >
          <div className="w-28 md:w-48">
            <Link to="/" className="text-white text-xl font-bold hover:text-yellow-200 transition-colors">
              Evento
            </Link>
          </div>
        </motion.div>

        {/* Navigation items */}
        <AnimatePresence>
          <ul className={`
          flex flex-col md:flex-row items-center
          ${isMenuOpen ? 'flex' : 'hidden'} md:flex
          md:items-center
          text-white
          absolute md:relative
          top-14 md:top-0
          left-0
          w-full md:w-auto md:max-w-88
          md:bg-transparent
          pb-4 md:pb-0
          md:space-x-12
          rounded-b-lg
          px-4 md:px-8
          md:flex-1
          md:justify-center
          ${isMenuOpen ? 'bg-gradient-to-r from-indigo-700 via-purple-700 to-pink-700' : 'bg-transparent'}
        `}>
            {navItems.map((item) => (
              <li key={item.label} className="w-full md:w-auto mx-auto md:max-w-44 flex-1">
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 1 }}
                  className="w-full md:w-auto"
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
            <li className="md:hidden w-full flex justify-center">
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 1 }}
              >
                {user ? (
                  <div className="relative">
                    <div
                      className="relative flex items-center cursor-pointer text-white"
                      onClick={() => setShowDropdown(!showDropdown)}
                    >
                      <div className="w-8 h-8 rounded-full flex items-center justify-center overflow-hidden">
                        <img
                          src={user.avatar || '/images/userM.png'}
                          alt={user.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <span className="hover:text-yellow-200 transition-colors block p-2 text-center text-lg font-medium">
                        {user.name}
                      </span>

                      {/* Dropdown menu */}
                      {showDropdown && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.2 }}
                          className="absolute left-6 top-full w-32 bg-gradient-to-r from-indigo-700/95 via-purple-700/95 to-pink-700/95 rounded-md shadow-xl z-20 text-center border border-white/20"
                        >
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
                        </motion.div>
                      )}
                    </div>
                  </div>
                ) : (
                  <Link
                    to="/auth"
                    className="w-full hover:text-yellow-200 transition-colors block py-2 text-center text-lg font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Login
                  </Link>
                )}
              </motion.div>
            </li>
          </ul>
        </AnimatePresence>

        {/* Desktop auth section */}
        <div className="hidden md:block w-48 text-right">
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 1 }}
          >
            {user ? (
              <div className="relative">
                <div
                  className="relative flex items-center justify-end cursor-pointer"
                  onMouseEnter={() => setShowDropdown(true)}
                  onMouseLeave={() => setShowDropdown(false)}
                >
                  <div className="w-8 h-8 rounded-full flex items-center justify-center overflow-hidden">
                    <img
                      src={user.avatar || '/images/userM.png'}
                      alt={user.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="text-white hover:text-yellow-200 transition-colors block p-2 text-center text-lg font-medium">
                    {user.name.split(/[ _]/)[0]}
                  </span>

                  {/* Dropdown menu */}
                  {showDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute -right-2 top-full w-32 bg-gradient-to-r from-indigo-700/95 via-purple-700/95 to-pink-700/95 rounded-md shadow-xl z-20 border border-white/20 text-center"
                    >
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
                    </motion.div>
                  )}
                </div>
              </div>
            ) : (
              <Link
                to="/auth"
                className="text-white hover:text-yellow-200 transition-colors block py-2 text-right text-lg font-medium"
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