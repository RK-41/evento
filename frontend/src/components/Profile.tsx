import React from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import EventCard from './EventCard';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Dialog } from '@headlessui/react';
import { toast } from 'react-hot-toast';

const Profile: React.FC = () => {
  const { user, setUser, logout } = useAuth();
  const navigate = useNavigate();
  const [events, setEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [filteredEvents, setFilteredEvents] = useState<any[]>([]);
  const [newName, setNewName] = useState(user?.name || '');
  const [nameError, setNameError] = useState('');

  const categories = ['Conference', 'Workshop', 'Social', 'Other'];
  const statuses = ['Upcoming', 'Live', 'Ended'];

  useEffect(() => {
    const fetchUserData = async () => {
      if (user?._id) {
        try {
          setIsLoading(true);
          const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/users/${user._id}`);
          const data = response.data;

          if (data.createdEvents) {
            setEvents(data.createdEvents);
          }
        } catch (error) {
          console.error('Error fetching user events:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchUserData();
  }, [user?._id]);

  useEffect(() => {
    const filteredEvents = events
      .filter(event => {
        const categoryMatch = selectedCategory === 'all' || event.category === selectedCategory;
        const statusMatch = selectedStatus === 'all' || event.status === selectedStatus;
        return categoryMatch && statusMatch;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    setFilteredEvents(filteredEvents);
  }, [events, selectedCategory, selectedStatus]);

  useEffect(() => {
    events.forEach(event => {
      const eventDate = new Date(event.date);
      const today = new Date();
      const eventDateOnly = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate());
      const todayDateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());

      if (eventDateOnly > todayDateOnly) {
        event.status = 'Upcoming';
      } else if (eventDateOnly < todayDateOnly) {
        event.status = 'Ended';
      } else {
        event.status = 'Live';
      }
    });
  }, [events]);

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  const handleUpdateProfile = async () => {
    if (newName.length < 2) {
      setNameError('Name must be at least 2 characters long');
      return;
    }

    try {
      const response = await axios.patch(
        `${import.meta.env.VITE_API_URL}/api/users/${user?._id}`,
        { name: newName }
      );
      setUser(response.data);
      setIsEditProfileOpen(false);
      setNameError('');
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen w-full bg-gradient-to-r from-indigo-600/10 via-purple-600/10 to-pink-500/10 py-20 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-3xl mx-auto">
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-3xl md:text-4xl font-bold text-gray-800 text-center mb-8"
        >
          Your Profile
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, scale: 1 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white/10 backdrop-blur-lg rounded-xl shadow-xl p-8 border border-white/20"
        >
          <div className="space-y-8">
            {/* Profile Avatar */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="flex justify-center"
            >
              <div className="w-24 h-24 rounded-full flex items-center justify-center overflow-hidden">
                <img
                  src={user?.avatar || '/images/userM.png'}
                  alt={user?.name}
                  className="w-full h-full object-cover"
                />
              </div>
            </motion.div>

            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              {/* Personal Information */}
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="space-y-4"
              >
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                  Personal Information
                </h2>
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <span className="font-semibold text-gray-700 min-w-[100px]">Name:</span>
                    <span className="bg-white/50 backdrop-blur-sm rounded-lg px-4 py-2">
                      {user?.name || 'Not available'}
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <span className="font-semibold text-gray-700 min-w-[100px]">Email:</span>
                    <span className="bg-white/50 backdrop-blur-sm rounded-lg px-4 py-2">
                      {user?.email || 'Not available'}
                    </span>
                  </div>
                </div>
              </motion.div>

              {/* Account Settings */}
              {!user?.isGuest && (
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="space-y-4"
                >
                  <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                    Account Settings
                  </h2>
                  <div className="flex flex-col gap-4">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 1 }}
                      onClick={() => setIsEditProfileOpen(true)}
                      className="px-6 py-2 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 text-white rounded-lg hover:from-indigo-700 hover:via-purple-700 hover:to-pink-600 transition-all shadow-md cursor-pointer"
                    >
                      Edit Profile
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 1 }}
                      onClick={() => {
                        logout();
                        navigate('/');
                      }}
                      className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all shadow-md cursor-pointer"
                    >
                      Logout
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Events Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="mt-12 w-full"
      >
        <h2 className="text-3xl font-semibold text-gray-800 mb-6 text-center">
          Events Created by You
        </h2>

        {/* Add Filter Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col gap-6 mb-8"
        >
          {/* Categories */}
          <div className="flex flex-col items-center gap-3">
            <h3 className="text-gray-700 font-medium">Categories</h3>
            <div className="flex flex-wrap justify-center gap-2">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-4 py-2 rounded-lg transition-all duration-300 cursor-pointer ${selectedCategory === 'all'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                  : 'bg-white/30 hover:bg-white/50 text-gray-700 shadow-sm hover:shadow-md'
                  }`}
              >
                All
              </button>
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-lg transition-all duration-300 cursor-pointer ${selectedCategory === category
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                    : 'bg-white/30 hover:bg-white/50 text-gray-700 shadow-sm hover:shadow-md'
                    }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Statuses */}
          <div className="flex flex-col items-center gap-3">
            <h3 className="text-gray-700 font-medium">Status</h3>
            <div className="flex flex-wrap justify-center gap-2">
              <button
                onClick={() => setSelectedStatus('all')}
                className={`px-4 py-2 rounded-lg transition-all duration-300 cursor-pointer ${selectedStatus === 'all'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                  : 'bg-white/30 hover:bg-white/50 text-gray-700 shadow-sm hover:shadow-md'
                  }`}
              >
                All
              </button>
              {statuses.map(status => (
                <button
                  key={status}
                  onClick={() => setSelectedStatus(status)}
                  className={`px-4 py-2 rounded-lg transition-all duration-300 cursor-pointer ${selectedStatus === status
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                    : 'bg-white/30 hover:bg-white/50 text-gray-700 shadow-sm hover:shadow-md'
                    }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        <div className="flex flex-wrap justify-center gap-4">
          {isLoading ? (
            <div className="flex items-center justify-center w-full py-32 bg-white/10 backdrop-blur-lg rounded-xl">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
          ) : filteredEvents.length > 0 ? (
            filteredEvents.map((event) => (
              <motion.div
                key={event._id}
                variants={item}
                whileHover={{ scale: 1.02 }}
                onClick={() => navigate(`/events/${event._id}`)}
                className="cursor-pointer transform transition-all duration-300 hover:translate-y-[-4px]"
              >
                <EventCard event={event} />
              </motion.div>
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-center py-32 w-full"
            >
              <h3 className="text-xl text-gray-600">No events found</h3>
              {(selectedCategory !== 'all' || selectedStatus !== 'all') && (
                <p className="text-gray-500 mt-2">Try adjusting your filters</p>
              )}
            </motion.div>
          )}
        </div>
      </motion.div>

      <Dialog
        open={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" aria-hidden="true" />

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="mx-auto w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
            <Dialog.Title className="text-xl font-semibold mb-4">Edit Profile</Dialog.Title>
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={newName}
                  onChange={(e) => {
                    setNewName(e.target.value);
                    setNameError('');
                  }}
                  className={`h-10 mt-1 px-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${nameError ? 'border-red-500' : ''
                    }`}
                />
                {nameError && (
                  <p className="mt-1 text-sm text-red-600">{nameError}</p>
                )}
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setIsEditProfileOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateProfile}
                  className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 rounded-md hover:from-indigo-700 hover:via-purple-700 hover:to-pink-600"
                >
                  Save
                </button>
              </div>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </motion.div>
  );
};

export default Profile;
