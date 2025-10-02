import React, { useState, useMemo } from 'react';
import type { Trip, FirebaseTimestamp } from '../firebase/models';
import type { BookingQuery } from '../types';
import { ChevronDownIcon, RightCaratIcon } from './IconComponents';

interface TripResultsProps {
  trips: Trip[];
  onBook: (trip: Trip) => void;
  searchQuery: BookingQuery;
}

const formatTimestamp = (timestamp: FirebaseTimestamp): string => {
  if (!timestamp || typeof timestamp.seconds !== 'number') return 'N/A';
  const date = new Date(timestamp.seconds * 1000);
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).replace(' ', '');
};

const formatDuration = (start: FirebaseTimestamp, end: FirebaseTimestamp): string => {
  if (!start || !end) return 'N/A';
  const durationMinutes = (end.seconds - start.seconds) / 60;
  const hours = Math.floor(durationMinutes / 60);
  const minutes = Math.round(durationMinutes % 60);
  return `${hours}h ${minutes}m`;
};

const TripCard: React.FC<{ trip: Trip; onBook: (trip: Trip) => void }> = ({ trip, onBook }) => {
  const isLimitedSeats = trip.seatsAvailable <= 5;

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden mb-4">
      <div className="p-4 border-b">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2 md:space-x-4">
            <div className="text-center">
              <p className="text-lg font-semibold text-dark">{formatTimestamp(trip.departureDatetime)}</p>
              <p className="text-sm text-gray-600">{trip.originCity.substring(0,3).toUpperCase()}</p>
            </div>
            <RightCaratIcon className="h-5 w-5 text-gray-400" />
            <div className="text-center">
              <p className="text-lg font-semibold text-dark">{formatTimestamp(trip.arrivalDatetime)}</p>
              <p className="text-sm text-gray-600">{trip.destinationCity.substring(0,3).toUpperCase()}</p>
            </div>
          </div>
          <div className="hidden md:block text-center">
            <p className="text-sm text-gray-600">{formatDuration(trip.departureDatetime, trip.arrivalDatetime)}</p>
            <a href="#" className="text-sm text-primary underline hover:no-underline">{trip.id.substring(0,6).toUpperCase()}</a>
          </div>
          <div className="hidden md:block text-center">
             <p className="text-sm text-gray-600">Nonstop</p>
          </div>
        </div>
         {isLimitedSeats && (
          <p className="text-red-600 text-xs font-bold mt-2 text-center md:text-left">Only {trip.seatsAvailable} seats left at this price!</p>
        )}
      </div>
      <div className="p-4 bg-gray-50 flex justify-between items-center">
        <div>
           <p className="text-sm font-semibold text-primary">Big Ben Express</p>
           <p className="text-xs text-gray-500">{trip.vehicleType}</p>
        </div>
        <div className="flex items-center space-x-4">
            <a href="#" className="font-semibold text-primary hover:underline">Details</a>
            <button onClick={() => onBook(trip)} className="font-semibold text-primary hover:underline">Seats</button>
        </div>
      </div>
      <div className="p-4">
         <button onClick={() => onBook(trip)} className="w-full border-2 border-primary rounded-lg p-4 text-left hover:bg-blue-50 transition-colors">
            <div className="flex justify-between items-center">
                <div>
                    <p className="font-semibold text-primary">Core</p>
                    <p className="text-sm text-gray-600">Options from</p>
                </div>
                <div className="text-right">
                    <p className="text-2xl font-bold text-primary">${trip.baseFare.toFixed(2)}</p>
                </div>
            </div>
             <div className="flex justify-center mt-2">
                <ChevronDownIcon className="h-5 w-5 text-primary" />
            </div>
            <div className="relative h-1 mt-3 bg-gradient-to-r from-blue-300 to-orange-300 rounded-full overflow-hidden"></div>
         </button>
      </div>
    </div>
  );
};

export const TripResults: React.FC<TripResultsProps> = ({ trips, onBook, searchQuery }) => {
  const [sortBy, setSortBy] = useState<'time' | 'price'>('time');
  
  const sortedTrips = useMemo(() => {
    return [...trips].sort((a, b) => {
      if (sortBy === 'price') {
        return a.baseFare - b.baseFare;
      }
      return a.departureDatetime.seconds - b.departureDatetime.seconds;
    });
  }, [trips, sortBy]);

  const departureDate = new Date(searchQuery.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  return (
    <div className="w-full animate-fade-in">
      <div className="mb-6">
        <h2 className="text-2xl md:text-3xl font-bold text-dark">
          Results for {searchQuery.from} to {searchQuery.to}
        </h2>
        <p className="text-gray-600">Departing: {departureDate}</p>
      </div>
      <div className="flex justify-end mb-4">
        <div className="relative">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'time' | 'price')}
            className="appearance-none bg-white border border-gray-300 rounded-md py-2 pl-3 pr-8 text-sm font-semibold text-dark focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="time">Sort: Best match</option>
            <option value="price">Sort: Price (Lowest)</option>
          </select>
          <ChevronDownIcon className="h-5 w-5 text-gray-500 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>
      <div>
        {sortedTrips.map(trip => (
          <TripCard key={trip.id} trip={trip} onBook={onBook} />
        ))}
      </div>
    </div>
  );
};
