import React from 'react';
import { BuildingOfficeIcon, SunIcon, CameraIcon } from './IconComponents';
import type { BookingQuery } from '../types';

interface PopularRoutesProps {
  onSearch: (query: BookingQuery) => void;
}

const routes = [
  {
    from: 'Heathrow Airport (LHR)',
    to: 'Central London (All Zones)',
    tag: 'Commercial Hub',
    tagIcon: BuildingOfficeIcon,
    description: 'Travel comfortably between Heathrow and the commercial city of London in just one hour.',
    price: '£25',
    imageUrl: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?q=80&w=2940&auto=format&fit=crop',
  },
  {
    from: 'Gatwick Airport (LGW)',
    to: 'Kensington',
    tag: 'Tourist Paradise',
    tagIcon: SunIcon,
    description: 'Connect between the Garden City and the beautiful tourist destination of Kensington.',
    price: '£35',
    imageUrl: 'https://images.unsplash.com/photo-1528562369475-575573623543?q=80&w=2874&auto=format&fit=crop',
  },
  {
    from: 'King\'s Cross Station',
    to: 'Westminster',
    tag: 'Beautiful Cities',
    tagIcon: CameraIcon,
    description: 'Quick and comfortable travel between two of London\'s most beautiful cities.',
    price: '£15',
    imageUrl: 'https://images.unsplash.com/photo-1533929736458-ca588913cde6?q=80&w=2874&auto=format&fit=crop',
  },
];

export const PopularRoutes: React.FC<PopularRoutesProps> = ({ onSearch }) => {

  const handleRouteClick = (from: string, to: string) => {
    const query: BookingQuery = {
      from,
      to,
      tripType: 'one-way',
      date: new Date().toISOString().split('T')[0],
      passengers: 1,
    };
    onSearch(query);
  };

  return (
    <section className="bg-gray-50 py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center text-dark mb-12">
          Popular Routes
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {routes.map((route, index) => (
            <div key={index} className="bg-white rounded-lg shadow-lg overflow-hidden flex flex-col transform hover:-translate-y-2 transition-transform duration-300">
              <div className="relative">
                <img src={route.imageUrl} alt={`${route.from} to ${route.to}`} className="w-full h-56 object-cover" />
                <div className="absolute top-4 left-4 bg-black bg-opacity-50 text-white text-xs font-semibold px-3 py-1.5 rounded-full flex items-center">
                  <route.tagIcon className="w-4 h-4 mr-2" />
                  {route.tag}
                </div>
              </div>
              <div className="p-6 flex-grow flex flex-col">
                <h3 className="text-xl font-bold text-primary mb-2">{route.from} - {route.to}</h3>
                <p className="text-gray-600 mb-4 flex-grow">{route.description}</p>
                <div className="flex justify-between items-center mt-auto pt-4 border-t">
                  <div>
                    <span className="text-sm text-gray-500">From </span>
                    <span className="font-bold text-lg text-dark">{route.price}</span>
                  </div>
                  <button 
                    onClick={() => handleRouteClick(route.from, route.to)}
                    className="bg-primary text-white font-bold py-2 px-5 rounded-lg hover:bg-blue-800 transition-colors"
                  >
                    View Trips
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};