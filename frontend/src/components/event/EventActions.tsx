import { motion } from 'framer-motion';
import { Event } from '../../types';
import { useMemo, useState } from 'react';
import { Dialog } from '@headlessui/react';

interface EventActionsProps {
  event: Event;
  eventStatus: string | null;
  isJoined: boolean;
  user: any;
  onJoin: () => void;
  onLeave: () => void;
  onDelete: () => void;
  currentJoinedEvent?: { _id: string; title: string } | null;
}

const EventActions = ({
  event,
  eventStatus,
  isJoined,
  user,
  onJoin,
  onLeave,
  onDelete,
  currentJoinedEvent
}: EventActionsProps) => {
  const isOrganizer = useMemo(() => user?._id === event.organizer?._id, [user?._id, event.organizer?._id]);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showSwitchEventDialog, setShowSwitchEventDialog] = useState(false);
  console.log(currentJoinedEvent, event);

  const handleJoinClick = () => {
    if (currentJoinedEvent && currentJoinedEvent._id !== event._id) {
      setShowSwitchEventDialog(true);
    } else {
      onJoin();
    }
  };

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
          <>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowDeleteDialog(true)}
              className="px-6 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white transition-all shadow-md cursor-pointer"
            >
              Delete Event
            </motion.button>

            <Dialog
              open={showDeleteDialog}
              onClose={() => setShowDeleteDialog(false)}
              className="relative z-50"
            >
              <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

              <div className="fixed inset-0 flex items-center justify-center p-4">
                <Dialog.Panel className="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full">
                  <Dialog.Title className="text-lg font-semibold mb-4">
                    Confirm Delete
                  </Dialog.Title>
                  <Dialog.Description className="mb-6">
                    Are you sure you want to delete this event?
                  </Dialog.Description>

                  <div className="flex justify-end gap-4">
                    <button
                      onClick={() => setShowDeleteDialog(false)}
                      className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        onDelete();
                        setShowDeleteDialog(false);
                      }}
                      className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white transition-all"
                    >
                      Delete
                    </button>
                  </div>
                </Dialog.Panel>
              </div>
            </Dialog>
          </>
        )}

        {!isJoined ? (
          <>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleJoinClick}
              disabled={eventStatus === 'Ended' || event.participants?.length >= event.maxParticipants}
              className={`px-6 py-2 rounded-lg ${eventStatus === 'Ended' || event.participants?.length >= event.maxParticipants
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-600 cursor-pointer'
                } text-white transition-all shadow-md`}
            >
              {event.participants?.length >= event.maxParticipants
                ? 'Event Full'
                : 'Join Event'}
            </motion.button>

            <Dialog
              open={showSwitchEventDialog}
              onClose={() => setShowSwitchEventDialog(false)}
              className="relative z-50"
            >
              <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

              <div className="fixed inset-0 flex items-center justify-center p-4">
                <Dialog.Panel className="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full">
                  <Dialog.Title className="text-xl font-semibold mb-4">
                    Switch Events
                  </Dialog.Title>
                  <Dialog.Description className="mb-6">
                    Do you want to leave <strong>{currentJoinedEvent?.title}</strong> and join <strong>{event.title}</strong>?
                  </Dialog.Description>

                  <div className="flex justify-end gap-4">
                    <button
                      onClick={() => setShowSwitchEventDialog(false)}
                      className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 transition-all cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        onJoin();
                        setShowSwitchEventDialog(false);
                      }}
                      className="px-4 py-2 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 text-white rounded-lg hover:from-indigo-700 hover:via-purple-700 hover:to-pink-600 transition-all shadow-md cursor-pointer"
                    >
                      Switch Event
                    </button>
                  </div>
                </Dialog.Panel>
              </div>
            </Dialog>
          </>
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