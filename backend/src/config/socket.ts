import { Server, Socket } from 'socket.io';
import { Server as HTTPServer } from 'http';

export const createSocketServer = (server: HTTPServer) => {
	const io = new Server(server, {
		cors: {
			origin: process.env.FRONTEND_URL || 'http://localhost:5173',
			methods: ['GET', 'POST'],
			credentials: true,
			allowedHeaders: ['*'],
		},
		path: '/socket.io/',
		transports: ['websocket'],
		pingTimeout: 60000,
		pingInterval: 25000,
		allowEIO3: true,
		connectTimeout: 45000,
	});

	return io;
};

export const setupSocket = (io: Server) => {
	io.on('connection', (socket: Socket) => {
		console.log('Client connected:', socket.id);

		socket.on('disconnect', (reason) => {
			console.log(`Client disconnected (${socket.id}). Reason: ${reason}`);
		});

		socket.on('error', (err) => {
			console.error('Socket error:', err);
		});
	});

	io.engine.on('connection_error', (err) => {
		console.error('Socket.IO connection error:', {
			code: err.code,
			message: err.message,
		});
	});
};
