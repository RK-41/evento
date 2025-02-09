import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';

interface JwtPayload {
	userId: string;
}

declare global {
	namespace Express {
		interface Request {
			user?: any;
		}
	}
}

export const protect = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		let token;

		if (req.headers.authorization?.startsWith('Bearer')) {
			token = req.headers.authorization.split(' ')[1];
		}

		if (!token) {
			return res.status(401).json({ message: 'Not authorized, no token' });
		}

		// Verify token
		const decoded = jwt.verify(
			token,
			process.env.JWT_SECRET as string
		) as JwtPayload;

		// Get user from token
		const user = await User.findById(decoded.userId).select('-password');
		if (!user) {
			return res
				.status(401)
				.json({ message: 'Not authorized, user not found' });
		}

		req.user = user;
		next();
	} catch (error) {
		console.error('Auth middleware error:', error);
		res.status(401).json({ message: 'Not authorized, token failed' });
	}
};

export const allowGuest = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		let token;

		if (req.headers.authorization?.startsWith('Bearer')) {
			token = req.headers.authorization.split(' ')[1];
		}

		if (!token) {
			return next();
		}

		const decoded = jwt.verify(
			token,
			process.env.JWT_SECRET as string
		) as JwtPayload;
		const user = await User.findById(decoded.userId).select('-password');

		if (user) {
			req.user = user;
		}

		next();
	} catch (error) {
		next();
	}
};
