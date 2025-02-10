import { Request, Response } from 'express';
import User from '../models/User';
import Event from '../models/Event';
import { Types } from 'mongoose';

export const getUserProfile = async (req: Request, res: Response) => {
	try {
		const user = await User.findById(req.params.id).populate('createdEvents');

		if (!user) {
			return res.status(404).json({ message: 'User not found' });
		}

		res.json(user);
	} catch (error) {
		res.status(500).json({ message: 'Server error', error });
	}
};

export const updateUserEvents = async (req: Request, res: Response) => {
	try {
		const { userId } = req.params;
		const { eventId } = req.body;

		const updatedUser = await User.findByIdAndUpdate(
			userId,
			{ $push: { createdEvents: eventId } },
			{ new: true }
		).populate('createdEvents');

		if (!updatedUser) {
			return res.status(404).json({ message: 'User not found' });
		}

		res.json(updatedUser);
	} catch (error) {
		res.status(500).json({ message: 'Error updating user events', error });
	}
};

export const updateUserProfile = async (req: Request, res: Response) => {
	try {
		const { id } = req.params;
		const { name } = req.body;

		const updatedUser = await User.findByIdAndUpdate(
			id,
			{ name },
			{ new: true }
		);

		if (!updatedUser) {
			return res.status(404).json({ message: 'User not found' });
		}

		res.json(updatedUser);
	} catch (error) {
		res.status(500).json({ message: 'Error updating user profile', error });
	}
};

export const deleteEvent = async (req: Request, res: Response) => {
	try {
		const { userId, eventId } = req.params;

		// Find the user and check if they own the event
		const user = await User.findById(userId);
		if (!user) {
			return res.status(404).json({ message: 'User not found' });
		}

		// Check if the event exists in user's createdEvents
		if (!user.createdEvents.includes(new Types.ObjectId(eventId))) {
			return res
				.status(403)
				.json({ message: 'Not authorized to delete this event' });
		}

		// Remove the event from user's createdEvents array
		await User.findByIdAndUpdate(userId, {
			$pull: { createdEvents: new Types.ObjectId(eventId) },
		});

		// Delete the event from the Event collection
		const deletedEvent = await Event.findByIdAndDelete(
			new Types.ObjectId(eventId)
		);
		if (!deletedEvent) {
			return res.status(404).json({ message: 'Event not found' });
		}

		res.json({ message: 'Event deleted successfully' });
	} catch (error) {
		res.status(500).json({ message: 'Error deleting event', error });
	}
};
