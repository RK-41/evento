import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';


const eventSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), 'Invalid date format'),
  location: z.string().min(3, 'Location must be at least 3 characters'),
  category: z.enum(['Conference', 'Workshop', 'Social', 'Other']),
  maxAttendees: z.number().optional(),
  imageFile: z.any().optional(),
  status: z.enum(['Upcoming', 'Live', 'Ended']).optional(),
  maxParticipants: z.number().min(1, 'Minimum participants should be 1'),
});


type EventFormData = z.infer<typeof eventSchema>;

const EventForm = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
  });
  console.log(errors);

  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const { socket } = useSocket();

  useEffect(() => {
    const script = document.createElement('script');
    script.src = "https://upload-widget.cloudinary.com/latest/global/all.js";
    script.type = "text/javascript";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const openCloudinaryWidget = () => {
    // @ts-ignore
    cloudinary.openUploadWidget(
      {
        cloud_name: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME,
        upload_preset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET,
        // sources: ['local', 'url', 'camera'],
        resource_type: 'image',
        client_allowed_formats: ['jpg', 'png', 'gif'],
        multiple: false,
      },
      (error: any, result: any) => {
        if (!error && result && result.event === "success") {
          console.log('Upload result:', result);
          setImageUrl(result.info.secure_url);
        } else {
          console.error('Upload error:', error);
        }
      }
    );
  };

  const onSubmit = async (data: EventFormData) => {
    try {
      const eventData = {
        ...data,
        date: new Date(data.date),
        imageUrl: imageUrl,
        organizer: {
          _id: user?._id,
          name: user?.name,
          email: user?.email,
          avatar: user?.avatar || ""
        },
      };

      // Create event
      const eventResponse = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/events`,
        eventData
      );

      // Update user's createdEvents array
      await axios.patch(
        `${import.meta.env.VITE_API_URL}/api/users/${user?._id}/events`,
        { eventId: eventResponse.data._id }
      );

      // Emit the new event through the socket
      if (socket) {
        socket.emit('newEvent', eventResponse.data);
      }

      navigate(`/events/${eventResponse.data._id}`);

    } catch (error) {
      console.error('Error creating event:', error);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen w-full bg-gradient-to-r from-indigo-600/10 via-purple-600/10 to-pink-500/10 py-12 px-4 sm:px-6 lg:px-8"
    >
      <motion.div
        initial={{ y: 20 }}
        animate={{ y: 0 }}
        className="max-w-3xl mx-auto"
      >
        <motion.h1
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          className="text-4xl font-bold text-gray-800 text-center mb-8"
        >
          Create an Event
        </motion.h1>

        <motion.form
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          onSubmit={handleSubmit(onSubmit)}
          className="bg-white/30 rounded-xl shadow-xl p-8 space-y-6"
        >
          <div className="space-y-6">
            <div className="form-group">
              <label className="block text-sm font-medium text-gray-800 mb-2">
                Event Title
              </label>
              <input
                type="text"
                {...register('title')}
                className="w-full p-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                placeholder="Enter event title"
              />
              {errors.title && (
                <p className="mt-2 text-sm text-red-600">{errors.title.message}</p>
              )}
            </div>

            <div className="form-group">
              <label className="block text-sm font-medium text-gray-800 mb-2">
                Description
              </label>
              <textarea
                {...register('description')}
                rows={4}
                className="w-full p-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                placeholder="Describe your event"
              />
              {errors.description && (
                <p className="mt-2 text-sm text-red-600">{errors.description.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="form-group">
                <label className="block text-sm font-medium text-gray-800 mb-2">
                  Date
                </label>
                <input
                  type="date"
                  {...register('date')}
                  className="w-full p-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                />
                {errors.date && (
                  <p className="mt-2 text-sm text-red-600">{errors.date.message}</p>
                )}
              </div>

              <div className="form-group">
                <label className="block text-sm font-medium text-gray-800 mb-2">
                  Location
                </label>
                <input
                  type="text"
                  {...register('location')}
                  className="w-full p-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  placeholder="Enter location"
                />
                {errors.location && (
                  <p className="mt-2 text-sm text-red-600">{errors.location.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="form-group">
                <label className="block text-sm font-medium text-gray-800 mb-2">
                  Category
                </label>
                <select
                  {...register('category')}
                  className="w-full p-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                >
                  <option value="">Select a category</option>
                  <option value="Conference">Conference</option>
                  <option value="Workshop">Workshop</option>
                  <option value="Social">Social</option>
                  <option value="Other">Other</option>
                </select>
                {errors.category && (
                  <p className="mt-2 text-sm text-red-600">{errors.category.message}</p>
                )}
              </div>

              <div className="form-group">
                <label className="block text-sm font-medium text-gray-800 mb-2">
                  Max Participants
                </label>
                <input
                  type="number"
                  {...register('maxParticipants', { valueAsNumber: true })}
                  className="w-full p-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  placeholder="Enter maximum participants"
                />
                {errors.maxParticipants && (
                  <p className="mt-2 text-sm text-red-600">{errors.maxParticipants.message}</p>
                )}
              </div>
            </div>

            <div className="form-group">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.95 }}
                type="button"
                onClick={openCloudinaryWidget}
                className="w-full p-3 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 text-white rounded-lg hover:from-indigo-700 hover:via-purple-700 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all cursor-pointer"
              >
                Upload Image
              </motion.button>
              {imageUrl && (
                <p className="mt-2 text-sm text-green-600">Image uploaded successfully!</p>
              )}
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            className="w-full p-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 text-white rounded-lg hover:from-indigo-700 hover:via-purple-700 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all cursor-pointer"
          >
            Create Event
          </motion.button>
        </motion.form>
      </motion.div>
    </motion.div>
  );
};

export default EventForm; 