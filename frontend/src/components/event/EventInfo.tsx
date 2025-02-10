import { Event } from '../../types';

interface EventInfoProps {
  event: Event;
}

const EventInfo = ({ event }: EventInfoProps) => {
  return (
    <div className="space-y-3 text-gray-700">
      <p className="flex flex-col items-start gap-2">
        <span className="font-semibold">Description:</span>
        <span className="bg-white/50 backdrop-blur-sm rounded-lg px-3 py-1 w-full">{event.description}</span>
      </p>
      <p className="flex items-center gap-2">
        <span className="font-semibold">Date:</span>

        <span className="bg-white/50 backdrop-blur-sm rounded-lg px-3 py-1">
          {new Date(event.date).toLocaleDateString('en-GB')}
        </span>
      </p>
      <p className="flex items-center gap-2">
        <span className="font-semibold">Location:</span>
        <span className="bg-white/50 backdrop-blur-sm rounded-lg px-3 py-1">{event.location}</span>
      </p>
      <p className="flex items-center gap-2">
        <span className="font-semibold">Category:</span>
        <span className="bg-white/50 backdrop-blur-sm rounded-lg px-3 py-1">{event.category}</span>
      </p>
      <p className="flex items-center gap-2">
        <span className="font-semibold">Max Participants:</span>
        <span className="bg-white/50 backdrop-blur-sm rounded-lg px-3 py-1">{event.maxParticipants}</span>
      </p>
      <p className="flex items-center gap-2">
        <span className="font-semibold">Organizer:</span>
        <span className="bg-white/50 backdrop-blur-sm rounded-lg px-3 py-1">
          {event.organizer?.name || 'N/A'}
        </span>
      </p>
      <p className="flex items-center gap-2">
        <span className="font-semibold">Created On:</span>
        <span className="bg-white/50 backdrop-blur-sm rounded-lg px-3 py-1">{new Date(event.createdAt).toLocaleDateString('en-GB')}</span>
      </p>
    </div>

  );
};

export default EventInfo; 