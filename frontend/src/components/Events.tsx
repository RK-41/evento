import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import EventCard from './EventCard';
import { motion } from 'framer-motion';
import { useSocket } from '../context/SocketContext';

interface Event {
  id: string;
  title: string;
  date: string;
  imageUrl?: string;
  category: string;
  status: string;
  [key: string]: any;
}

const Events = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const navigate = useNavigate();
  const { socket } = useSocket();

  const categories = ['Conference', 'Workshop', 'Social', 'Other'];
  const statuses = ['Upcoming', 'Live', 'Ended'];
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);

  useEffect(() => {
    const filteredEvents = events
      .filter(event => {
        const categoryMatch = selectedCategory === 'all' || event.category === selectedCategory;
        const statusMatch = selectedStatus === 'all' || event.status === selectedStatus;
        return categoryMatch && statusMatch;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()); // Sort by date descending
    setFilteredEvents(filteredEvents);
  }, [events, selectedCategory, selectedStatus]);


  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/events`); // Adjust the API endpoint as needed
        const data = await response.json();
        setEvents(data);
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  useEffect(() => {
    events.forEach(event => {
      const eventDate = new Date(event.date);
      const today = new Date();

      // Compare only dates by resetting time to midnight
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

  useEffect(() => {
    if (socket) {
      // Listen for event updates
      socket.on('eventUpdated', (updatedEvent: Event) => {
        setEvents(prevEvents =>
          prevEvents.map(event =>
            event._id === updatedEvent._id ? updatedEvent : event
          )
        );
      });

      // Listen for new events
      socket.on('newEvent', (newEvent: Event) => {
        setEvents(prevEvents => [...prevEvents, newEvent]);
      });

      // Listen for deleted events
      socket.on('eventDeleted', (eventId: string) => {
        setEvents(prevEvents =>
          prevEvents.filter(event => event._id !== eventId)
        );
      });
    }

    return () => {
      if (socket) {
        socket.off('eventUpdated');
        socket.off('newEvent');
        socket.off('eventDeleted');
      }
    };
  }, [socket]);

  const container = {
    hidden: { opacity: 0 },

    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Check out our Events
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover and participate in our exciting events happening around you
          </p>
        </div>

        <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8">
          <div className="flex items-center justify-center gap-2">
            <label className="text-gray-700">Category:</label>
            <select
              title="Category"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-center gap-2">
            <label className="text-gray-700">Status:</label>
            <select
              title="Status"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="all">All Statuses</option>
              {statuses.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
        </div>

        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8"
        >
          {filteredEvents.map((event) => (
            <motion.div
              key={event._id}
              variants={item}
              whileHover={{ scale: 1.02 }}
              onClick={() => navigate(`/events/${event._id}`)}
              className="cursor-pointer"
            >
              <EventCard event={event} />
            </motion.div>
          ))}
        </motion.div>

        {filteredEvents.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-xl text-gray-600">No events found</h3>
          </div>
        )}
      </div>
    </div>
  );
};

export default Events;
