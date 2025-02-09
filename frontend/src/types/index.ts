export interface Event {
	_id: string;
	title: string;
	description: string;
	date: Date;
	location: string;
	category: 'Conference' | 'Workshop' | 'Social' | 'Other';
	imageUrl?: string;
	maxParticipants: number;
	participants: User[];
	organizer: User;
	status: 'Upcoming' | 'Live' | 'Ended';
	createdAt: Date;
	updatedAt: Date;
}

export interface User {
	_id: string;
	name: string;
	email: string;
	avatar: string;
	isGuest: boolean;
	createdEvents: string[];
	joinedEvents: string[];
	createdAt: Date;
	updatedAt: Date;
}
