export const calculateEventStatus = (
	eventDate: Date | string
): 'Live' | 'Ended' | 'Upcoming' => {
	const today = new Date();
	today.setHours(0, 0, 0, 0); // Reset time to start of day

	const eventDateObj = new Date(eventDate);
	eventDateObj.setHours(0, 0, 0, 0); // Reset time to start of day

	if (eventDateObj.getTime() === today.getTime()) {
		return 'Live';
	} else if (eventDateObj < today) {
		return 'Ended';
	} else {
		return 'Upcoming';
	}
};
