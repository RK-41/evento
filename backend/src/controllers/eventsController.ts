import { Request, Response } from 'express';
import Event from '../models/Event';
import User from '../models/User';
import { Server } from 'socket.io';

let io: Server;

export const setIO = (_io: Server) => {
	io = _io;
};

export const getAllEvents = async (req: Request, res: Response) => {
	try {
		const events = await Event.find();
		res.json(events);
	} catch (error) {
		res.status(500).json({ message: 'Server error', error });
	}
};

export const createEvent = async (req: Request, res: Response) => {
	try {
		const newEvent = new Event(req.body);
		const savedEvent = await newEvent.save();
		res.status(201).json(savedEvent);
	} catch (error) {
		res.status(400).json({ message: 'Error creating event', error });
	}
};

export const getEventById = async (req: Request, res: Response) => {
	try {
		const event = await Event.findById(req.params.id)
			.populate('organizer', 'name email avatar')
			.populate('participants', 'name email avatar');

		if (!event) {
			return res.status(404).json({ message: 'Event not found' });
		}

		res.json(event);
	} catch (error) {
		console.error('Error fetching event:', error);
		res.status(500).json({ message: 'Server error', error });
	}
};

export const joinEvent = async (req: Request, res: Response) => {
	try {
		const event = await Event.findByIdAndUpdate(
			req.params.id,
			{ $addToSet: { participants: req.body.userId } },
			{ new: true }
		).populate('participants', 'name email avatar');

		if (!event) {
			return res.status(404).json({ message: 'Event not found' });
		}

		if (io) {
			io.to(`event:${req.params.id}`).emit('EVENT_UPDATED', event);
			io.to(`event:${req.params.id}`).emit(
				'PARTICIPANTS_UPDATED',
				event.participants
			);
		}

		res.json(event);
	} catch (error) {
		res.status(500).json({ message: 'Server error', error });
	}
};

export const leaveEvent = async (req: Request, res: Response) => {
	try {
		const event = await Event.findByIdAndUpdate(
			req.params.id,
			{ $pull: { participants: req.body.userId } },
			{ new: true }
		).populate('participants', 'name email avatar');

		if (!event) {
			return res.status(404).json({ message: 'Event not found' });
		}

		res.json(event);
	} catch (error) {
		res.status(500).json({ message: 'Server error', error });
	}
};

export const getJoinStatus = async (req: Request, res: Response) => {
	try {
		const event = await Event.findById(req.params.id);
		if (!event) {
			return res.status(404).json({ message: 'Event not found' });
		}
		const user = await User.findById(req.body.userId);
		if (!user) {
			return res.status(404).json({ message: 'User not found' });
		}
		const isJoined = event.participants.includes(user._id);
		res.json({ isJoined });
	} catch (error) {
		res.status(500).json({ message: 'Server error', error });
	}
};

export const getEventParticipants = async (req: Request, res: Response) => {
	try {
		const event = await Event.findById(req.params.id).populate(
			'participants',
			'name email avatar'
		);

		if (!event) {
			return res.status(404).json({ message: 'Event not found' });
		}

		res.json(event.participants);
	} catch (error) {
		console.error('Error fetching participants:', error);
		res.status(500).json({ message: 'Server error', error });
	}
};

export const updateEventStatus = async (req: Request, res: Response) => {
	try {
		const event = await Event.findByIdAndUpdate(
			req.params.id,
			{ $set: { status: req.body.status } },
			{ new: true }
		)
			.populate('organizer', 'name email avatar')
			.populate('participants', 'name email avatar');

		if (!event) {
			return res.status(404).json({ message: 'Event not found' });
		}

		if (io) {
			io.to(`event:${req.params.id}`).emit('EVENT_UPDATED', event);
		}

		res.json(event);
	} catch (error) {
		console.error('Error updating event status:', error);
		res.status(500).json({ message: 'Server error', error });
	}
};
