import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import { Event } from '../types';
import { SOCKET_EVENTS } from '../constants/socketEvents';
import { calculateEventStatus } from '../utils/eventUtils';
import EventHeader from './event/EventHeader';
import EventActions from './event/EventActions';
import EventInfo from './event/EventInfo';
import ParticipantsList from './event/ParticipantsList';
import React from 'react';
import { toast } from 'react-hot-toast';

// Memoize child components at the top of the file, before the main component
const MemoizedEventHeader = React.memo(EventHeader);
const MemoizedEventActions = React.memo(EventActions);
const MemoizedEventInfo = React.memo(EventInfo);
const MemoizedParticipantsList = React.memo(ParticipantsList);

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
  const [currentJoinedEvent, setCurrentJoinedEvent] = useState<{ _id: string; title: string } | null>(null);

  // Fetch user's current event
  useEffect(() => {
    const fetchCurrentEvent = async () => {
      if (!user) return;

      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/users/${user._id}/current-event`,
          { headers: { Authorization: `Bearer ${user.token}` } }
        );

        if (response.data && response.data._id !== id) { // Don't set if it's the current event
          setCurrentJoinedEvent({
            _id: response.data._id,
            title: response.data.title
          });
        }
      } catch (error) {
        console.error('Error fetching current event:', error);
      }
    };

    fetchCurrentEvent();
  }, [user, id]);

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
      setEvent(prevEvent => ({
        ...updatedEvent,
        organizer: updatedEvent.organizer || prevEvent?.organizer
      }));
    });

    socket.on(SOCKET_EVENTS.PARTICIPANTS_UPDATED, (updatedParticipants: any[]) => {
      setParticipants(updatedParticipants);
    });

    // Modify the socket listeners to dismiss existing toasts
    socket.on(SOCKET_EVENTS.USER_JOINED_EVENT, ({ user: joinedUser }) => {
      if (joinedUser._id !== user?._id) {
        toast.dismiss(); // Dismiss existing toasts
        toast.success(`${joinedUser.name} joined the event!`);
      }
    });

    socket.on(SOCKET_EVENTS.USER_LEFT_EVENT, ({ user: leftUser }) => {
      if (leftUser._id !== user?._id) {
        toast.dismiss(); // Dismiss existing toasts
        toast.success(`${leftUser.name} left the event`);
      }
    });

    // Cleanup
    return () => {
      socket.emit(SOCKET_EVENTS.LEAVE_ROOM, id);
      socket.off(SOCKET_EVENTS.EVENT_UPDATED);
      socket.off(SOCKET_EVENTS.PARTICIPANTS_UPDATED);
      socket.off(SOCKET_EVENTS.USER_JOINED_EVENT);
      socket.off(SOCKET_EVENTS.USER_LEFT_EVENT);
    };
  }, [socket, id, user?._id]);

  // Memoize handlers
  const handleJoinEvent = useCallback(async () => {
    if (!user) {
      navigate('/login', { state: { from: `/events/${id}` } });
      return;
    }

    try {
      // If user is in another event, leave it first
      if (currentJoinedEvent) {
        await axios.put(
          `${import.meta.env.VITE_API_URL}/api/events/${currentJoinedEvent._id}/leave`,
          { userId: user._id },
          { headers: { Authorization: `Bearer ${user.token}` } }
        );

        socket?.emit(SOCKET_EVENTS.USER_LEFT_EVENT, {
          eventId: currentJoinedEvent._id,
          user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            avatar: user.avatar
          }
        });
      }

      // Join the new event
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/events/${id}/join`,
        { userId: user._id },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );

      setIsJoined(true);
      setCurrentJoinedEvent(null);
      setEvent(prevEvent => ({
        ...prevEvent,
        ...response.data,
        organizer: prevEvent?.organizer
      }));
      socket?.emit(SOCKET_EVENTS.USER_JOINED_EVENT, {
        eventId: id,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          avatar: user.avatar
        }
      });
      toast.dismiss(); // Dismiss existing toasts
      toast.success('You joined the event!');
    } catch (error) {
      console.error('Error joining event:', error);
      toast.dismiss(); // Dismiss existing toasts
      toast.error('Failed to join event');
    }
  }, [user, navigate, id, socket, currentJoinedEvent]);

  const handleLeaveEvent = useCallback(async () => {
    try {
      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/api/events/${id}/leave`,
        { userId: user?._id },
        { headers: { Authorization: `Bearer ${user?.token}` } }
      );

      setIsJoined(false);
      setEvent(prevEvent => ({
        ...prevEvent,
        ...response.data,
        organizer: prevEvent?.organizer
      }));
      socket?.emit(SOCKET_EVENTS.USER_LEFT_EVENT, {
        eventId: id,
        user: {
          _id: user?._id,
          name: user?.name,
          email: user?.email,
          avatar: user?.avatar
        }
      });
      toast.dismiss(); // Dismiss existing toasts
      toast.success('You left the event');
    } catch (error) {
      console.error('Error leaving event:', error);
      toast.dismiss(); // Dismiss existing toasts
      toast.error('Failed to leave event');
    }
  }, [user, id, socket]);

  const handleDeleteEvent = useCallback(async () => {
    if (!user || !event) return;

    try {
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/api/users/${user._id}/events/${id}`,
        { headers: { Authorization: `Bearer ${user.token}` } }
      );

      socket?.emit(SOCKET_EVENTS.EVENT_DELETED, id);
      navigate('/profile');
      toast.dismiss();
      toast.success('Event deleted successfully');
    } catch (error) {
      console.error('Error deleting event:', error);
      toast.dismiss();
      toast.error('Failed to delete event');
      setError('Failed to delete event');
    }
  }, [user, event, id, socket, navigate]);

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
                status: newStatus,
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
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.5 }}
        className="min-h-screen w-full bg-gradient-to-r from-indigo-600/10 via-purple-600/10 to-pink-500/10 py-20 px-4 sm:px-6 lg:px-8"
      >
        <motion.div
          initial={{ y: 20 }}
          animate={{ y: 0 }}
          className="max-w-3xl mx-auto bg-white/10 backdrop-blur-lg rounded-xl shadow-xl p-8"
        >
          <MemoizedEventHeader event={event} />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <MemoizedEventActions
                event={event}
                eventStatus={eventStatus}
                isJoined={isJoined}
                user={user}
                onJoin={handleJoinEvent}
                onLeave={handleLeaveEvent}
                onDelete={handleDeleteEvent}
                currentJoinedEvent={currentJoinedEvent}
              />
            </div>

            <MemoizedEventInfo event={event} />

            {event && (
              <MemoizedParticipantsList
                participants={participants}
                maxParticipants={event.maxParticipants}
              />
            )}
          </div>
        </motion.div>
      </motion.div>
    </>
  );
};

export default EventDetails; 