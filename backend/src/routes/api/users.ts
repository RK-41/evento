import { Router } from 'express';
import {
	getUserProfile,
	updateUserEvents,
	updateUserProfile,
} from '../../controllers/usersController';

const router = Router();

// Get user profile
router.get('/:id', getUserProfile);

// Update user's createdEvents array
router.patch('/:userId/events', updateUserEvents);

// Update user profile
router.patch('/:id', updateUserProfile);

export default router;
