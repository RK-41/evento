import { Router } from 'express';
import {
	getUserProfile,
	updateUserEvents,
	updateUserProfile,
	deleteEvent,
} from '../../controllers/usersController';
import { protect } from '../../middleware/auth';

const router = Router();

// Get user profile
router.get('/:id', getUserProfile);

// Update user's createdEvents array
router.patch('/:userId/events', updateUserEvents);

// Update user profile
router.patch('/:id', updateUserProfile);

// Delete event (protected route)
router.delete('/:userId/events/:eventId', protect, deleteEvent);

export default router;
