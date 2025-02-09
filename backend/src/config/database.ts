import mongoose from 'mongoose';
import Event from '../models/Event';

export const connectDB = async (): Promise<void> => {
	try {
		await mongoose.connect(process.env.MONGODB_URI as string);
		console.log('🍃 Connected to MongoDB');

		// Test the connection by counting events
		const eventCount = await Event.countDocuments();
		console.log(`Database contains ${eventCount} events`);
	} catch (err) {
		console.error('MongoDB connection error:', err);
		process.exit(1);
	}
};
