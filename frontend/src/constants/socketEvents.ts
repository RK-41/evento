// Common event names to be used across frontend and backend
export const SOCKET_EVENTS = {
	JOIN_ROOM: 'join-room',
	LEAVE_ROOM: 'leave-room',
	EVENT_UPDATED: 'event-updated',
	PARTICIPANTS_UPDATED: 'participants-updated',
	JOIN_EVENT: 'join-event',
	LEAVE_EVENT: 'leave-event',
} as const;
