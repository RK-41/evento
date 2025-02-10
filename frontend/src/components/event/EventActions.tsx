import { motion } from 'framer-motion';
import { Event } from '../../types';
import { useMemo } from 'react';

interface EventActionsProps {
  event: Event;
  eventStatus: string | null;
  isJoined: boolean;
  user: any;
  onJoin: () => void;
  onLeave: () => void;
  onDelete: () => void;
}

const EventActions = ({
  event,
  eventStatus,
  isJoined,
  user,
  onJoin,
  onLeave,
  onDelete
}: EventActionsProps) => {
  const isOrganizer = useMemo(() => user?._id === event.organizer?._id, [user?._id, event.organizer?._id]);

  return (
    <div className="w-full flex flex-col sm:flex-row justify-between gap-2">
      <p className={`text-lg font-semibold px-4 py-1 rounded-full inline-block w-max
        ${eventStatus === 'Live' ? 'bg-green-500/20 text-green-700' :

          eventStatus === 'Upcoming' ? 'bg-blue-500/20 text-blue-700' :
            'bg-red-500/20 text-red-700'}`}
      >
        {eventStatus}
      </p>

      <div className="flex justify-between gap-2">
        {isOrganizer && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
            onClick={onDelete}
            className="px-6 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white transition-all shadow-md cursor-pointer"
          >
            Delete Event
          </motion.button>
        )}

        {!isJoined ? (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
            onClick={onJoin}
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
            onClick={onLeave}
            className="px-6 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white transition-all shadow-md cursor-pointer"
          >
            Leave Event
          </motion.button>
        )}
      </div>
    </div>
  );
};

export default EventActions; 