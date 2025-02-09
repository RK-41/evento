import { Request, Response } from 'express';
import User from '../models/User';

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
