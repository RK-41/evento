// Common event names to be used across frontend and backend
export const SOCKET_EVENTS = {
	JOIN_ROOM: 'join-room',
	LEAVE_ROOM: 'leave-room',
	EVENT_UPDATED: 'event-updated',
	PARTICIPANTS_UPDATED: 'participants-updated',
	EVENT_DELETED: 'event-deleted',
	USER_JOINED_EVENT: 'user-joined-event',
	USER_LEFT_EVENT: 'user-left-event',
} as const;
