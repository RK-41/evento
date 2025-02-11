# Evento - Real-time Event Management Platform

## Overview

Evento is a modern, real-time event management platform built with the MERN stack (MongoDB, Express.js, React, Node.js) and Socket.IO for real-time features. It enables users to create, manage, and participate in various events while providing real-time updates.

## Features

### Core Features

- 🎫 Create and manage events with detailed information
- 👥 Real-time participant updates
- 🔄 Live event status updates
- 📊 Dynamic event categorization
- 🖼️ Image upload support via Cloudinary
- 🔐 User authentication and authorization
- 📱 Responsive design for all devices
- 🔔 Push notifications for event updates
  <!-- - 📍 Location-based event discovery -->
  <!-- - 💬 Real-time chat for event participants -->
  <!-- - 📅 Calendar integration -->
  <!-- - 🎨 Customizable event pages -->

### Event Categories

- Conference
- Workshop
- Social
- Other
<!-- - Webinar
- Meetup
- Concert
- Exhibition
- Sports -->

### Event Statuses

- Upcoming
- Live
- Ended
  <!-- - Cancelled -->
  <!-- - Postponed -->

## Tech Stack

### Frontend

- React with TypeScript
- Vite for build tooling
- Axios for API requests
- Zod for form validation
- React Router for navigation
- Socket.IO Client for real-time features
- Framer Motion for animations
- TailwindCSS for styling

### Backend

- Node.js with Express
- TypeScript
- MongoDB with Mongoose
- Socket.IO for real-time communication
- JWT for authentication
- Cloudinary for image management

## Deployment

The application is deployed and accessible at:

- [Frontend](https://evento-olive.vercel.app/): Deployed on Vercel
- [Backend](https://evento-serve.up.railway.app/): Deployed on Railway

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn
- Cloudinary account

### Installation

1. Clone the repository

2. Install dependencies for both frontend and backend

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

3. Create `.env` files:

Backend `.env`:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
```

Frontend `.env`:

```env
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
VITE_CLOUDINARY_CLOUD_NAME=your_cloudinary_name
VITE_CLOUDINARY_UPLOAD_PRESET=your_cloudinary_upload_preset
```

4. Start the development servers

```bash
# Start backend server
cd backend
npm run dev

# Start frontend server (in a new terminal)
cd frontend
npm run dev
```

The application should now be running at `http://localhost:5173`
