import { motion } from 'framer-motion';

interface ParticipantsListProps {
  participants: any[];
  maxParticipants: number;
}

const ParticipantsList = ({ participants, maxParticipants }: ParticipantsListProps) => {
  return (
    <div className="mt-8 space-y-6">
      <div className="flex flex-col gap-4">
        <h3 className="text-2xl font-semibold text-gray-800">Participants: {participants?.length || 0} / {maxParticipants}</h3>
      </div>

      {participants && participants.length > 0 && (
        <div className="mt-2">
          {/* <h3 className="text-2xl font-semibold text-gray-800 mb-4">Participants</h3> */}
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
  );
};

export default ParticipantsList; 