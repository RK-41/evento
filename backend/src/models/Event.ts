import mongoose, { Schema, model, Document, Types } from 'mongoose';

interface IEvent extends Document {
	title: string;
	description: string;
	date: Date;
	location: string;
	category: 'Conference' | 'Workshop' | 'Social' | 'Other';
	imageUrl?: string;
	organizer: Types.ObjectId;
	participants: Types.ObjectId[];
	maxParticipants: number;
	status: 'Upcoming' | 'Live' | 'Ended' | undefined;
	createdAt: Date;
	updatedAt: Date;
}

const eventSchema = new Schema<IEvent>(
	{
		title: {
			type: String,
			required: true,
			trim: true,
		},
		description: {
			type: String,
			required: true,
		},
		date: {
			type: Date,
			required: true,
		},
		location: {
			type: String,
			// required: true,
		},
		category: {
			type: String,
			// required: true,
			enum: ['Conference', 'Workshop', 'Social', 'Other'],
			default: 'Other',
		},
		imageUrl: {
			type: String,
		},
		organizer: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: true,
		},
		participants: {
			type: [Schema.Types.ObjectId],
			ref: 'User',
			default: [],
		},
		maxParticipants: {
			type: Number,
			required: true,
			min: 1,
		},
		status: {
			type: String,
			enum: ['Upcoming', 'Live', 'Ended'],
			default: 'Upcoming',
		},
	},
	{
		timestamps: true,
	}
);

export default model<IEvent>('Event', eventSchema);
