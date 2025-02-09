import React from 'react';
import HeroSection from './HeroSection';
import Events from './Events';

const HomePage: React.FC = () => {
  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-50">
      <HeroSection />
      <Events />
    </div>


  );
};

export default HomePage;
