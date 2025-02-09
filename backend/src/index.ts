import dotenv from 'dotenv';
import express from 'express';
import { createServer } from 'http';
import { connectDB } from './config/database';
import { createSocketServer, setupSocket } from './config/socket';
import { setupExpress } from './config/express';
import eventHandlers from './socket/eventHandlers';
import { setIO } from './routes/api/events';

dotenv.config();

const app = express();
const server = createServer(app);
const io = createSocketServer(server);

// Setup application components
setupExpress(app, io);
setupSocket(io);
eventHandlers(io);
setIO(io);

// Connect to database
connectDB();

// Start server
const PORT: number = parseInt(process.env.PORT || '5000', 10);
server.listen(PORT, () => {
	console.log(`❄️ Server running on port ${PORT}`);
});
