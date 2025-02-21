import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const HeroSection: React.FC = () => {
  const navigate = useNavigate();

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
      className="relative flex flex-col justify-center items-center text-center min-h-screen w-full bg-slate-900 overflow-hidden"
    >
      {/* Animated background */}
      <div className="absolute inset-0 w-full h-full">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(79,70,229,0.35),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(236,72,153,0.25),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(147,51,234,0.35),transparent_50%)]" />
      </div>
      {/* Main content */}
      <div className="relative z-[1] px-4 w-full max-w-7xl mx-auto">
        <motion.h1
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="text-4xl sm:text-6xl md:text-7xl font-extrabold mb-6 text-white tracking-tight"
        >
          Create Unforgettable
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-yellow-400">
            Event Experiences
          </span>
        </motion.h1>
        <motion.p
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="text-xl md:text-2xl text-white/90 mb-8 max-w-2xl mx-auto"
        >
          Your all-in-one platform to discover, plan, and host extraordinary events that bring people together.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <button
            onClick={() => navigate('/create-event')}
            className="px-8 py-2 sm:py-4 bg-white text-slate-950 rounded-full font-bold text-lg hover:bg-opacity-90 transform hover:scale-105 transition-all shadow-lg cursor-pointer"
          >
            Get Started
          </button>
          <button
            onClick={() => navigate('/events')}
            className="px-8 py-2 sm:py-4 bg-transparent border-2 border-white text-white rounded-full font-bold text-lg hover:bg-white/10 transform hover:scale-105 transition-all cursor-pointer"
          >
            Checkout Events
          </button>

        </motion.div>
      </div>
    </motion.section>
  );
};

export default HeroSection; 