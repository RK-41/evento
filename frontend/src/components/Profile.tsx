import React from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import EventCard from './EventCard';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Dialog } from '@headlessui/react';

const Profile: React.FC = () => {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const [events, setEvents] = useState<any[]>([]);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [newName, setNewName] = useState(user?.name || '');
  const [nameError, setNameError] = useState('');

  useEffect(() => {
    const fetchUserData = async () => {
      if (user?._id) {
        try {
          const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/users/${user._id}`);
          const data = response.data;
          console.log(data);
          if (data.createdEvents) {
            setEvents(data.createdEvents);
          }
        } catch (error) {
          console.error('Error fetching user events:', error);
        }
      }
    };

    fetchUserData();
  }, [user?._id]);

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
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen w-full bg-gradient-to-r from-indigo-600/10 via-purple-600/10 to-pink-500/10 py-12 px-4 sm:px-6 lg:px-8"
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
          initial={{ opacity: 0, scale: 0.95 }}
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
              <div className="w-24 h-24 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
            </motion.div>

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
                <div className="flex gap-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsEditProfileOpen(true)}
                    className="px-6 py-2 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 text-white rounded-lg hover:from-indigo-700 hover:via-purple-700 hover:to-pink-600 transition-all shadow-md cursor-pointer"
                  >
                    Edit Profile
                  </motion.button>
                  {/* <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-all shadow-md"
                  >
                    Change Password
                  </motion.button> */}
                </div>
              </motion.div>
            )}
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
        <div className="flex flex-wrap justify-center gap-4">
          {events.length > 0 ? (
            events.map((event) => (
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
            <p className="text-gray-600 col-span-2 text-center py-8 bg-white/10 backdrop-blur-lg rounded-xl">
              You haven't created any events yet.
            </p>
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
