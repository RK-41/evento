import { motion } from 'framer-motion';
import { Event } from '../../types';

interface EventHeaderProps {
  event: Event;
}

const EventHeader = ({ event }: EventHeaderProps) => {
  return (
    <>
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
        {event.title}
      </motion.h1>
    </>
  );
};

export default EventHeader; 