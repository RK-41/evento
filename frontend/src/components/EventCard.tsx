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
      className="p-6 bg-white/10 rounded-xl shadow-xl mb-4 w-[360px] mx-auto overflow-hidden border border-white/20"
    >
      <motion.img
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        src={event.imageUrl ?? '/images/eventImage.jpg'}
        alt={event.title || 'Event image'}
        className="w-full h-48 object-cover rounded-lg shadow-md mb-4"
        onError={(e) => {
          e.currentTarget.src = '/images/eventImage.jpg';
        }}

      />

      <motion.div className="space-y-4">
        <div className="flex justify-between items-start">
          <motion.h2
            initial={{ y: -10 }}
            animate={{ y: 0 }}
            className="text-xl font-bold text-gray-800 truncate max-w-[200px]"
          >
            {event.title}
          </motion.h2>
          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${status === 'Live'
            ? 'bg-green-500/20 text-green-700'
            : status === 'Upcoming'
              ? 'bg-blue-500/20 text-blue-700'
              : 'bg-red-500/20 text-red-700'
            }`}>
            {status}
          </span>
        </div>

        <div className="space-y-2 text-gray-700">
          {Object.entries(event)
            .filter(([key]) => ['description', 'date', 'location', 'category'].includes(key))
            .map(([key, value]) => (
              <p key={key} className="flex items-center gap-2">
                <span className="font-semibold capitalize">{key}:</span>
                <span className="bg-white/50 rounded-lg px-3 py-1">
                  {(() => {
                    switch (key) {
                      case 'description':
                        return (value as string).substring(0, 16) + '...';
                      case 'date':
                        return new Date(value as string).toLocaleDateString('en-GB');
                      default:
                        return String(value);
                    }
                  })()}
                </span>
              </p>
            ))}
        </div>

        <div className="pt-4">
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
            className="w-full py-2 px-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 text-white rounded-lg hover:from-indigo-700 hover:via-purple-700 hover:to-pink-600 transition-all text-center cursor-pointer shadow-md"
          >
            View Details
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default EventCard; 