import React from 'react';
import { ClockIcon, SparklesIcon, ShieldCheckIcon } from './IconComponents';

const features = [
  {
    icon: ClockIcon,
    title: 'Reliable Schedules',
    description: 'Our shuttles depart on time, every time, with multiple daily departures on popular routes.',
    imageUrl: 'https://images.unsplash.com/photo-1524552144782-a2ac3141935c?q=80&w=2940&auto=format&fit=crop',
  },
  {
    icon: SparklesIcon,
    title: 'Comfortable Vehicles',
    description: 'Enjoy your journey in our modern, air-conditioned Toyota Sienna minivans with comfortable seating.',
    imageUrl: 'https://images.unsplash.com/photo-1589156229683-e18729971052?q=80&w=2824&auto=format&fit=crop',
  },
  {
    icon: ShieldCheckIcon,
    title: 'Safety First',
    description: 'Your safety is our priority with professional drivers, well-maintained vehicles, and strict safety protocols.',
    imageUrl: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=2940&auto=format&fit=crop',
  },
];

export const WhyChooseUs: React.FC = () => {
  return (
    <section className="bg-white py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center text-dark mb-12">
          Why Choose Big Ben Express?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="bg-white rounded-lg shadow-lg overflow-hidden text-center transform hover:-translate-y-2 transition-transform duration-300">
              <div className="relative">
                <img src={feature.imageUrl} alt={feature.title} className="w-full h-56 object-cover" />
                <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                  <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-full p-4">
                    <feature.icon className="h-8 w-8 text-white" />
                  </div>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-dark mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};