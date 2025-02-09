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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-indigo-600/10 via-purple-600/10 to-pink-500/10">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-r from-indigo-600/10 via-purple-600/10 to-pink-500/10 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            Check out our Events
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover and participate in our exciting events happening around you
          </p>
        </motion.div>

        {/* Filter Section */}
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
                className={`px-4 py-2 rounded-lg transition-all duration-300 ${selectedCategory === 'all'
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                    : 'bg-white/30 hover:bg-white/50 text-gray-700 shadow-sm hover:shadow-md'
                  }`}
              >
                All Categories
              </button>
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-lg transition-all duration-300 ${selectedCategory === category
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
                className={`px-4 py-2 rounded-lg transition-all duration-300 ${selectedStatus === 'all'
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                    : 'bg-white/30 hover:bg-white/50 text-gray-700 shadow-sm hover:shadow-md'
                  }`}
              >
                All Statuses
              </button>
              {statuses.map(status => (
                <button
                  key={status}
                  onClick={() => setSelectedStatus(status)}
                  className={`px-4 py-2 rounded-lg transition-all duration-300 ${selectedStatus === status
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

        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          // className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8"
          className='flex flex-wrap justify-center gap-6 mt-8'
        >
          {filteredEvents.map((event) => (
            <motion.div
              key={event._id}
              variants={item}
              whileHover={{ scale: 1.02 }}
              onClick={() => navigate(`/events/${event._id}`)}
              className="cursor-pointer transform transition-all duration-300 hover:translate-y-[-4px]"
            >
              <EventCard key={event._id} event={event} />
            </motion.div>
          ))}
        </motion.div>

        {filteredEvents.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-center py-32 bg-white/10 backdrop-blur-lg rounded-xl shadow-lg"
          >
            <h3 className="text-xl text-gray-600">No events found</h3>
            <p className="text-gray-500 mt-2">Try adjusting your filters</p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Events;
