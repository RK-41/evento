import React from 'react';
import EventCard from './EventCard';
// Import Swiper components and styles
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
// Single CSS import for all Swiper styles
// import 'swiper/css';
// If still getting errors, try:
import 'swiper/swiper.css';






const EventSlider: React.FC = () => {
  // Dummy data for events
  const events = [
    { id: 1, title: 'Event 1', description: 'Description for event 1' },
    { id: 2, title: 'Event 2', description: 'Description for event 2' },
    // Add more events as needed
  ];

  return (
    <div className="w-full h-96 py-4 mt-4">
      <p>Event Slider</p>
      <Swiper
        modules={[Navigation, Pagination, Autoplay]}
        spaceBetween={30}
        slidesPerView={1}
        navigation
        pagination={{ clickable: true }}
        autoplay={{ delay: 2500, disableOnInteraction: false }}
        className="w-full mt-8"
      >
        {events.map(event => (
          <SwiperSlide key={event.id} className="max-w-[300px]">
            <EventCard event={event} />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default EventSlider; 