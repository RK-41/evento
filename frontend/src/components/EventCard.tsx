import { motion } from 'framer-motion';
import { calculateEventStatus } from '../utils/eventUtils';

const EventCard = ({ event }: { event: any }) => {
  const status = calculateEventStatus(event.date);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 300 }}
      className="p-4 bg-white rounded-lg shadow-md mb-4 max-w-sm mx-auto"
    >
      <motion.h2
        initial={{ y: -10 }}
        animate={{ y: 0 }}
        className="text-xl font-bold mb-2"
      >
        {event.title}
      </motion.h2>
      <p className={`font-semibold ${status === 'Live' ? 'text-green-500' : status === 'Upcoming' ? 'text-blue-500' : 'text-red-500'}`}>
        {status}
      </p>


      <div className="text-gray-500">
        {Object.entries(event)
          .filter(([key]) => ['description', 'date', 'location', 'category'].includes(key))
          .map(([key, value]) => (
            <p key={key} className="mb-1">
              <span className="font-semibold capitalize">{key}:</span>{' '}

              {(() => {
                switch (key) {
                  case 'description':
                    return (value as string).substring(0, 20) + '...';
                  case 'date':
                    return new Date(value as string).toISOString().split('T')[0];
                  default:
                    return String(value);
                }
              })()}
            </p>

          ))}

      </div>
      <motion.img
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        src={event.imageUrl ?? '/images/eventImage.jpg'}
        alt={event.title || 'Event image'}
        className="w-full h-48 object-cover rounded-lg mt-2"
        onError={(e) => {
          e.currentTarget.src = '/images/eventImage.jpg';
        }}
      />
    </motion.div>
  );
};

export default EventCard; 