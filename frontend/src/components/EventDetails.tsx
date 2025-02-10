import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import { Event } from '../types';
import { SOCKET_EVENTS } from '../constants/socketEvents';
import { calculateEventStatus } from '../utils/eventUtils';

const EventDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<Event | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { socket } = useSocket();
  const { user } = useAuth();
  const [isJoined, setIsJoined] = useState(false);
  const navigate = useNavigate();
  const [participants, setParticipants] = useState<any[]>([]);
  const [eventStatus, setEventStatus] = useState<string | null>(null);

  // Fetch initial event data
  useEffect(() => {
    const fetchEventData = async () => {
      try {
        const [eventResponse, participantsResponse] = await Promise.all([
          axios.get(`${import.meta.env.VITE_API_URL}/api/events/${id}`),
          axios.get(`${import.meta.env.VITE_API_URL}/api/events/${id}/participants`)
        ]);

        // Add error checking for responses
        if (!eventResponse.data) {
          throw new Error('No event data received');
        }

        console.log('Event data:', eventResponse.data);
        console.log('Participants data:', participantsResponse.data);


        setEvent(eventResponse.data);
        setParticipants(participantsResponse.data);

        // Check join status if user exists
        if (user) {
          const joinStatusResponse = await axios.post(
            `${import.meta.env.VITE_API_URL}/api/events/${id}/join-status`,
            { userId: user._id },
            { headers: { Authorization: `Bearer ${user.token}` } }
          );
          setIsJoined(joinStatusResponse.data.isJoined);
        }
      } catch (err: any) {
        // Improved error handling
        const errorMessage = err.response?.data?.message || err.message || 'Error fetching event data';
        setError(errorMessage);
        console.error('Error details:', err);
      }
    };

    if (id) {  // Only fetch if id exists
      fetchEventData();
    }
  }, [id, user]);

  // WebSocket setup
  useEffect(() => {
    if (!socket || !id) return;

    // Join event room
    socket.emit(SOCKET_EVENTS.JOIN_ROOM, id);

    // Listen for updates
    socket.on(SOCKET_EVENTS.EVENT_UPDATED, (updatedEvent: Event) => {
      setEvent(updatedEvent);
    });

    socket.on(SOCKET_EVENTS.PARTICIPANTS_UPDATED, (updatedParticipants: any[]) => {
      setParticipants(updatedParticipants);
    });

    // Cleanup
    return () => {
      socket.emit(SOCKET_EVENTS.LEAVE_ROOM, id);
      socket.off(SOCKET_EVENTS.EVENT_UPDATED);
      socket.off(SOCKET_EVENTS.PARTICIPANTS_UPDATED);
    };
  }, [socket, id]);

  const handleJoinEvent = async () => {
    if (!user) {
      navigate('/login', { state: { from: `/events/${id}` } });
      return;
    }

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/events/${id}/join`,
        { userId: user._id },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );

      setIsJoined(true);
      setEvent(response.data);
      socket?.emit(SOCKET_EVENTS.JOIN_EVENT, { eventId: id, event: response.data });
    } catch (error) {
      console.error('Error joining event:', error);
    }
  };

  const handleLeaveEvent = async () => {
    try {
      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/api/events/${id}/leave`,
        { userId: user?._id },
        { headers: { Authorization: `Bearer ${user?.token}` } }
      );

      setIsJoined(false);
      setEvent(response.data);
      socket?.emit(SOCKET_EVENTS.LEAVE_EVENT, { eventId: id, event: response.data });
    } catch (error) {
      console.error('Error leaving event:', error);
    }
  };

  const handleDeleteEvent = async () => {
    if (!user || !event) return;

    try {
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/api/users/${user._id}/events/${id}`,
        { headers: { Authorization: `Bearer ${user.token}` } }
      );

      // Emit socket event to notify other users
      socket?.emit(SOCKET_EVENTS.EVENT_DELETED, id);

      // Redirect to events page
      navigate('/profile');
    } catch (error) {
      console.error('Error deleting event:', error);
      setError('Failed to delete event');
    }

  };

  useEffect(() => {
    if (event) {
      const newStatus = calculateEventStatus(event.date);
      setEventStatus(newStatus);

      // If status has changed, update in database
      if (event.status !== newStatus) {
        const updateEventStatus = async () => {
          try {
            const response = await axios.patch(
              `${import.meta.env.VITE_API_URL}/api/events/${id}`,
              { status: newStatus },
              { headers: { Authorization: `Bearer ${user?.token}` } }
            );

            if (response.data) {
              setEvent(prevEvent => ({
                ...prevEvent!,
                status: newStatus
              }));

              // Emit socket event to notify other users
              socket?.emit(SOCKET_EVENTS.EVENT_UPDATED, response.data);
            }
          } catch (error) {
            console.error('Error updating event status:', error);
          }
        };

        updateEventStatus();
      }
    }
  }, [event?.date, id, user?.token, socket]);

  // Add this effect to listen for event deletion
  useEffect(() => {
    if (!socket) return;

    socket.on(SOCKET_EVENTS.EVENT_DELETED, (deletedEventId: string) => {
      if (deletedEventId === id) {
        navigate('/events');
      }
    });

    return () => {
      socket.off(SOCKET_EVENTS.EVENT_DELETED);
    };
  }, [socket, id, navigate]);

  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

  if (!event) {
    return <p className="text-gray-500">Loading...</p>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen w-full bg-gradient-to-r from-indigo-600/10 via-purple-600/10 to-pink-500/10 py-12 px-4 sm:px-6 lg:px-8"
    >
      <motion.div
        initial={{ y: 20 }}
        animate={{ y: 0 }}
        className="max-w-3xl mx-auto bg-white/10 backdrop-blur-lg rounded-xl shadow-xl p-8"
      >
        <motion.img
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          src={event.imageUrl ?? '/images/eventImage.jpg'}
          alt={event.title}
          className="w-full h-full object-cover rounded-lg shadow-lg"
        />

        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-3xl font-bold text-gray-800 mt-6 mb-4"
        >
          {event?.title}
        </motion.h1>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className={`text-lg font-semibold px-4 py-1 rounded-full inline-block
              ${eventStatus === 'Live' ? 'bg-green-500/20 text-green-700' :
                eventStatus === 'Upcoming' ? 'bg-blue-500/20 text-blue-700' :
                  'bg-red-500/20 text-red-700'}`}
            >
              {eventStatus}
            </p>

            <div className="flex gap-2">
              {/* Show delete button only to organizer */}
              {user?._id === event.organizer?._id && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleDeleteEvent}
                  className="px-6 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white transition-all shadow-md cursor-pointer"
                >
                  Delete Event
                </motion.button>
              )}

              {!isJoined ? (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleJoinEvent}
                  disabled={eventStatus === 'Ended' || event.participants?.length >= event.maxParticipants}
                  className={`px-6 py-2 rounded-lg cursor-pointer ${eventStatus === 'Ended' || event.participants?.length >= event.maxParticipants
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-600'
                    } text-white transition-all shadow-md`}
                >
                  {event.participants?.length >= event.maxParticipants
                    ? 'Event Full'
                    : 'Join Event'}
                </motion.button>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleLeaveEvent}
                  className="px-6 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white transition-all shadow-md cursor-pointer"
                >
                  Leave Event
                </motion.button>
              )}
            </div>
          </div>

          <div className="space-y-3 text-gray-700">
            <p className="flex items-center gap-2">
              <span className="font-semibold">Description:</span>
              <span className="bg-white/50 backdrop-blur-sm rounded-lg px-3 py-1">{event.description}</span>
            </p>
            <p className="flex items-center gap-2">
              <span className="font-semibold">Date:</span>
              <span className="bg-white/50 backdrop-blur-sm rounded-lg px-3 py-1">
                {new Date(event.date).toLocaleDateString('en-GB')}
              </span>
            </p>
            <p className="flex items-center gap-2">
              <span className="font-semibold">Location:</span>
              <span className="bg-white/50 backdrop-blur-sm rounded-lg px-3 py-1">{event.location}</span>
            </p>
            <p className="flex items-center gap-2">
              <span className="font-semibold">Category:</span>
              <span className="bg-white/50 backdrop-blur-sm rounded-lg px-3 py-1">{event.category}</span>
            </p>
            <p className="flex items-center gap-2">
              <span className="font-semibold">Organizer:</span>
              <span className="bg-white/50 backdrop-blur-sm rounded-lg px-3 py-1">{event.organizer?.name ?? 'N/A'}</span>
            </p>
            <p className="flex items-center gap-2">
              <span className="font-semibold">Max Participants:</span>
              <span className="bg-white/50 backdrop-blur-sm rounded-lg px-3 py-1">{event.maxParticipants}</span>
            </p>
          </div>
        </div>

        {event && (
          <div className="mt-8 space-y-6">
            <div className="flex flex-col gap-4">
              <p className="text-lg font-medium text-gray-800">
                Participants: {event.participants?.length || 0} / {event.maxParticipants}
              </p>
            </div>

            {participants && participants.length > 0 && (
              <div className="mt-8">
                <h3 className="text-2xl font-semibold text-gray-800 mb-4">Participants</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {participants.map((participant: any) => (
                    <motion.div
                      key={participant._id}
                      whileHover={{ scale: 1.02 }}
                      className="flex items-center gap-3 p-3 bg-white/50 backdrop-blur-sm rounded-lg shadow-sm overflow-hidden"
                    >
                      <img
                        src={participant.avatar || '/images/userM.png'}
                        alt={participant.name}
                        className="w-10 h-10 rounded-full border-2 border-white/50"
                      />
                      <span className="font-medium text-gray-800">{participant.name}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default EventDetails; 