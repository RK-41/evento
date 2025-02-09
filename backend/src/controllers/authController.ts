import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import User from '../models/User';

const generateToken = (userId: string): string => {
	return jwt.sign({ userId }, process.env.JWT_SECRET as string, {
		expiresIn: '30d',
	});
};

export const register = async (req: Request, res: Response) => {
	try {
		const { name, email, password } = req.body;

		// Check if user already exists
		const userExists = await User.findOne({ email });
		if (userExists) {
			return res.status(400).json({ message: 'User already exists' });
		}

		// Create new user
		const user = await User.create({
			name,
			email,
			password,
		});

		// Generate token
		const token = generateToken(user._id.toString());

		res.status(201).json({
			_id: user._id,
			name: user.name,
			email: user.email,
			avatar: user.avatar,
			token,
			isGuest: false,
		});
	} catch (error) {
		console.error('Registration error:', error);
		res.status(500).json({ message: 'Server error during registration' });
	}
};

export const login = async (req: Request, res: Response) => {
	try {
		const { email, password } = req.body;

		// Find user
		const user = await User.findOne({ email });
		if (!user) {
			return res.status(401).json({ message: 'Invalid email or password' });
		}

		// Check password
		const isMatch = await bcrypt.compare(password, user.password);
		if (!isMatch) {
			return res.status(401).json({ message: 'Invalid email or password' });
		}

		// Generate token
		const token = generateToken(user._id.toString());

		res.json({
			_id: user._id,
			name: user.name,
			email: user.email,
			avatar: user.avatar,
			token,
			isGuest: false,
		});
	} catch (error) {
		console.error('Login error:', error);
		res.status(500).json({ message: 'Server error during login' });
	}
};

// ... existing imports ...

export const guestLogin = async (req: Request, res: Response) => {
	try {
		// Generate a random guest name and email
		const guestId = Math.random().toString(36).substring(2, 8);
		const guestName = `Guest_${guestId}`;
		const guestEmail = `guest_${guestId}@temp.com`;
		const guestPassword = Math.random().toString(36).substring(2, 15);

		// Check if a guest user with this email already exists
		let guestUser = await User.findOne({ email: guestEmail });

		if (!guestUser) {
			// Create a new guest user if one doesn't exist
			guestUser = await User.create({
				name: guestName,
				email: guestEmail,
				password: guestPassword,
				isGuest: true,
			});
		}

		// Generate token
		const token = generateToken(guestUser._id.toString());

		// Send response
		res.status(200).json({
			_id: guestUser._id,
			name: guestUser.name,
			email: guestUser.email,
			avatar: guestUser.avatar,
			token,
			isGuest: true,
		});
	} catch (error) {
		console.error('Guest login error:', error);
		res.status(500).json({
			message: 'Failed to create guest account',
			error: error instanceof Error ? error.message : 'Unknown error',
		});
	}
};

// ... rest of the controller ...
