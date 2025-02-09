import { Router } from 'express';
import {
	getUserProfile,
	updateUserEvents,
} from '../../controllers/usersController';

const router = Router();

// Get user profile
router.get('/:id', getUserProfile);

// Update user's createdEvents array
router.patch('/:userId/events', updateUserEvents);

export default router;
