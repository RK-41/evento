import { Router } from 'express';
import {
	getAllEvents,
	createEvent,
	getEventById,
	joinEvent,
	leaveEvent,
	getJoinStatus,
	getEventParticipants,
	updateEventStatus,
	setIO,
} from '../../controllers/eventsController';

const router = Router();

export { setIO };

// Routes
router.get('/', getAllEvents);
router.post('/', createEvent);
router.get('/:id', getEventById);
router.post('/:id/join', joinEvent);
router.put('/:id/leave', leaveEvent);
router.post('/:id/join-status', getJoinStatus);
router.get('/:id/participants', getEventParticipants);
router.patch('/:id', updateEventStatus);

export default router;
