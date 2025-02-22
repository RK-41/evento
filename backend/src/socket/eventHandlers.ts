import { Server, Socket } from 'socket.io';
import Event from '../models/Event';
import User from '../models/User';
import { SOCKET_EVENTS } from '../constants/socketEvents';

interface Room {
	eventId: string;
	users: Set<string>;
}

const rooms: Map<string, Room> = new Map();

const eventHandlers = (io: Server) => {
	io.on('connection', (socket: Socket) => {
		console.log('Client connected:', socket.id);

		// Join room
		socket.on(SOCKET_EVENTS.JOIN_ROOM, (eventId: string) => {
			socket.join(`event:${eventId}`);
		});

		// Leave room
		socket.on(SOCKET_EVENTS.LEAVE_ROOM, (eventId: string) => {
			socket.leave(`event:${eventId}`);
		});

		// Handle event updates
		socket.on(SOCKET_EVENTS.EVENT_UPDATED, async ({ eventId, event }) => {
			socket.to(`event:${eventId}`).emit(SOCKET_EVENTS.EVENT_UPDATED, event);
		});

		// Handle user joined event
		socket.on(SOCKET_EVENTS.USER_JOINED_EVENT, async ({ eventId, user }) => {
			try {
				const updatedEvent = await Event.findById(eventId)
					.populate('participants', 'name email avatar')
					.populate('organizer', 'name email avatar');
				if (!updatedEvent) return;

				io.to(`event:${eventId}`).emit(
					SOCKET_EVENTS.EVENT_UPDATED,
					updatedEvent
				);
				io.to(`event:${eventId}`).emit(
					SOCKET_EVENTS.PARTICIPANTS_UPDATED,
					updatedEvent.participants
				);
				io.to(`event:${eventId}`).emit(SOCKET_EVENTS.USER_JOINED_EVENT, {
					user,
					eventId,
				});
			} catch (error) {
				console.error('Error handling user joined event:', error);
			}
		});

		// Handle user left event
		socket.on(SOCKET_EVENTS.USER_LEFT_EVENT, async ({ eventId, user }) => {
			try {
				const updatedEvent = await Event.findById(eventId)
					.populate('participants', 'name email avatar')
					.populate('organizer', 'name email avatar');
				if (!updatedEvent) return;

				io.to(`event:${eventId}`).emit(
					SOCKET_EVENTS.EVENT_UPDATED,
					updatedEvent
				);
				io.to(`event:${eventId}`).emit(
					SOCKET_EVENTS.PARTICIPANTS_UPDATED,
					updatedEvent.participants
				);
				io.to(`event:${eventId}`).emit(SOCKET_EVENTS.USER_LEFT_EVENT, {
					user,
					eventId,
				});
			} catch (error) {
				console.error('Error handling user left event:', error);
			}
		});

		// Handle page visit
		socket.on('userVisitedEventDetailsPage', ({ eventId, user }) => {
			console.log('User visited event page:', eventId, user);
			socket.join(`event:${eventId}`);
			socket
				.to(`event:${eventId}`)
				.emit('userVisitedEventDetailsPage', { eventId, user });
		});

		// Handle page leave
		socket.on('userLeftEventDetailsPage', (eventId) => {
			console.log('User left event page:', eventId);
			socket.leave(`event:${eventId}`);
		});

		socket.on('disconnect', () => {
			console.log('Client disconnected:', socket.id);
		});
	});
};

export default eventHandlers;
