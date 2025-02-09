import express, { Application } from 'express';
import cors from 'cors';
import authRoutes from '../routes/api/authRoutes';
import eventRoutes from '../routes/api/events';
import userRoutes from '../routes/api/users';
import { Server } from 'socket.io';

export const setupExpress = (app: Application, io: Server) => {
	// Middleware
	app.use(
		cors({
			origin: process.env.FRONTEND_URL || 'http://localhost:5173',
			credentials: true,
			methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
			allowedHeaders: [
				'Content-Type',
				'Authorization',
				'X-Requested-With',
				'Accept',
				'Origin',
				'Access-Control-Allow-Headers',
				'Access-Control-Request-Method',
				'Access-Control-Request-Headers',
			],
			exposedHeaders: ['Content-Range', 'X-Content-Range'],
		})
	);
	app.use(express.json());

	// Basic routes
	app.get('/', (req, res) => {
		res.send('Server is running');
	});

	app.get('/health', (req, res) => {
		res.json({
			status: 'ok',
			socketIO: io ? 'initialized' : 'not initialized',
			connections: io.engine.clientsCount,
		});
	});

	// API routes
	app.use('/api/authRoutes', authRoutes);
	app.use('/api/events', eventRoutes);
	app.use('/api/users', userRoutes);
};
