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
      className="p-6 bg-white rounded-lg shadow-md max-w-3xl mx-auto"
    >
      <motion.img
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        src={event.imageUrl ?? '/images/eventImage.jpg'}
        alt={event.title}
        className="w-full object-cover rounded-lg mt-4"
      />

      <motion.h1
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-2xl font-bold mb-4"
      >
        {event?.title}
      </motion.h1>
      <div className="space-y-2">
        <p className={`font-semibold ${eventStatus === 'Live' ? 'text-green-500' : eventStatus === 'Upcoming' ? 'text-blue-500' : 'text-red-500'}`}>
          {eventStatus}

        </p>
        <div className="text-gray-500 space-y-2">
          <p className="mb-1">
            <span className="font-semibold">Description:</span> {event.description}
          </p>
          <p className="mb-1">
            <span className="font-semibold">Date:</span> {new Date(event.date).toLocaleDateString('en-GB')}
          </p>
          <p className="mb-1">
            <span className="font-semibold">Location:</span> {event.location}
          </p>
          <p className="mb-1">
            <span className="font-semibold">Category:</span> {event.category}
          </p>
          <p className="mb-1">
            <span className="font-semibold">Organizer:</span> {event.organizer?.name ?? 'N/A'}
          </p>
          <p className="mb-1">
            <span className="font-semibold">Max Participants:</span> {event.maxParticipants}
          </p>
          <p className="mb-1">
            <span className="font-semibold">Status:</span> {eventStatus}
          </p>
        </div>
      </div>

      {event && (
        <div className="mt-6">
          <div className="flex items-center gap-4">
            <p className="text-lg">
              Participants: {event.participants?.length || 0} / {event.maxParticipants}
            </p>

            {!isJoined ? (
              <button
                onClick={handleJoinEvent}
                disabled={eventStatus === 'Ended' || event.participants?.length >= event.maxParticipants}
                className={`px-6 py-2 rounded-md ${eventStatus === 'Ended' || event.participants?.length >= event.maxParticipants
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 cursor-pointer'
                  } text-white transition-colors`}
              >
                {event.participants?.length >= event.maxParticipants
                  ? 'Event Full'
                  : 'Join Event'}
              </button>

            ) : (
              <button
                onClick={handleLeaveEvent}
                className="px-6 py-2 rounded-md bg-red-600 hover:bg-red-700 text-white transition-colors cursor-pointer"
              >
                Leave Event
              </button>
            )}
          </div>

          {participants && participants.length > 0 && (
            <div className="mt-6">
              <h3 className="text-xl font-semibold mb-3">Participants</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">

                {participants.map((participant: any) => (
                  <div
                    key={participant._id}
                    className="min-w-40 flex flex-wrap items-center gap-2 p-2 bg-gray-100 rounded-md"
                  >
                    <img


                      src={participant.avatar || 'https://res.cloudinary.com/dhka9aet3/image/upload/w_1000,c_fill,ar_1:1,g_auto,r_max,bo_5px_solid_red,b_rgb:262c35/v1739100300/dev1_gwoj0l.png'}
                      alt={participant.name}
                      className="w-8 h-8 rounded-full"
                    />
                    <span>{participant.name}</span>
                  </div>

                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default EventDetails; 