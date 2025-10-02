// Fix: Added a complete implementation for the SeatSelection component.
import React, { useState } from 'react';
import type { Trip } from '../firebase/models';
import type { BookingQuery } from '../types';
import { UserIcon } from './IconComponents';

interface SeatSelectionProps {
  trip: Trip;
  bookingQuery: BookingQuery;
  onConfirm: (seats: string[]) => void;
  onBack: () => void;
}

const Seat: React.FC<{ 
    seatNumber: string; 
    isBooked: boolean; 
    isSelected: boolean; 
    onSelect: (seatNumber: string) => void;
}> = ({ seatNumber, isBooked, isSelected, onSelect }) => {
    const seatClasses = [
        'w-12 h-12',
        'border-2',
        'rounded-md',
        'flex',
        'items-center',
        'justify-center',
        'font-mono',
        'text-sm',
        'transition-colors',
        'duration-200'
    ];

    if (isBooked) {
        seatClasses.push('bg-gray-400', 'border-gray-500', 'cursor-not-allowed');
    } else if (isSelected) {
        seatClasses.push('bg-primary', 'border-blue-800', 'cursor-pointer', 'text-white', 'font-bold');
    } else {
        seatClasses.push('bg-blue-100', 'border-primary', 'cursor-pointer', 'hover:bg-blue-200');
    }

    return (
        <button 
            className={seatClasses.join(' ')} 
            onClick={() => !isBooked && onSelect(seatNumber)}
            disabled={isBooked}
            aria-label={`Seat ${seatNumber}${isBooked ? ' (unavailable)' : ''}${isSelected ? ' (selected)' : ''}`}
        >
            {isBooked ? <UserIcon className="w-6 h-6 text-white" /> : seatNumber}
        </button>
    );
};

const SteeringWheelIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 12v6m0-9-3.5 2M12 12l3.5 2m-3.5-5.5L12 3m0 0l3.5 3.5" />
    </svg>
);


const SEAT_LAYOUT: (string | null)[][] = [
    ['D', '1'],
    ['2', null, '3'],
    ['4', null, '5'],
];

export const SeatSelection: React.FC<SeatSelectionProps> = ({ trip, bookingQuery, onConfirm, onBack }) => {
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const { passengers } = bookingQuery;
  
  const handleSelectSeat = (seatNumber: string) => {
    setSelectedSeats(prev => {
      if (prev.includes(seatNumber)) {
        return prev.filter(s => s !== seatNumber);
      }
      if (prev.length < passengers) {
        return [...prev, seatNumber];
      }
      return prev; // Don't allow selecting more than `passengers`
    });
  };

  const totalFare = trip.baseFare * selectedSeats.length;

  return (
    <div className="bg-white rounded-xl shadow-2xl p-6 md:p-8 text-dark animate-fade-in max-w-4xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        <div className="md:col-span-2">
            <h2 className="text-2xl font-bold mb-4">Select Your Seats</h2>
            <p className="text-gray-600 mb-6">Please select {passengers} seat{passengers > 1 ? 's' : ''}.</p>

            <div className="bg-gray-100 p-4 rounded-lg relative pt-8">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-gray-200 px-3 py-1 text-xs font-bold rounded-b-md">
                    Front of Van
                </div>
                <div className="bg-white p-6 rounded-md shadow-inner space-y-4 max-w-xs mx-auto">
                    {SEAT_LAYOUT.map((row, rowIndex) => (
                        <div key={rowIndex} className="flex justify-center items-center gap-4">
                            {row.map((seatNumber, seatIndex) => {
                                if (seatNumber === null) return <div key={`aisle-${rowIndex}-${seatIndex}`} className="w-12 h-12"></div>;
                                if (seatNumber === 'D') return <div key="driver" className="w-12 h-12 border-2 border-gray-400 bg-gray-300 rounded-md flex items-center justify-center" title="Driver"><SteeringWheelIcon className="w-8 h-8 text-gray-600" /></div>;
                                return <Seat key={seatNumber} seatNumber={seatNumber} isBooked={trip.bookedSeats.includes(seatNumber)} isSelected={selectedSeats.includes(seatNumber)} onSelect={handleSelectSeat} />;
                            })}
                        </div>
                    ))}
                </div>
            </div>
            <div className="flex justify-center space-x-6 mt-6 text-sm text-gray-700">
                <div className="flex items-center"><div className="w-4 h-4 rounded bg-blue-100 border-primary border mr-2"></div>Available</div>
                <div className="flex items-center"><div className="w-4 h-4 rounded bg-primary border-blue-800 border mr-2"></div>Selected</div>
                <div className="flex items-center"><div className="w-4 h-4 rounded bg-gray-400 border-gray-500 border mr-2"></div>Unavailable</div>
            </div>
        </div>

        <div className="md:col-span-1">
            <h3 className="text-xl font-bold mb-4">Booking Summary</h3>
            <div className="bg-gray-50 p-4 rounded-lg border">
                <p><strong>From:</strong> {trip.originCity}</p>
                <p><strong>To:</strong> {trip.destinationCity}</p>
                <div className="mt-4 pt-4 border-t">
                    <p><strong>Passengers:</strong> {passengers}</p>
                    <p><strong>Seats:</strong> {selectedSeats.join(', ') || 'None'}</p>
                </div>
                <div className="mt-4 pt-4 border-t">
                    <p className="flex justify-between font-bold text-lg"><span>Total</span><span>${totalFare.toFixed(2)}</span></p>
                </div>
            </div>
            <div className="mt-6 space-y-3">
                <button 
                    onClick={() => onConfirm(selectedSeats)} 
                    disabled={selectedSeats.length !== passengers}
                    className="w-full bg-primary text-white font-bold py-3 px-8 rounded-lg hover:bg-blue-800 transition-colors disabled:bg-gray-400"
                >
                    Continue
                </button>
                <button onClick={onBack} className="w-full bg-transparent text-primary font-bold py-3 px-8 rounded-lg hover:bg-gray-100 border border-primary">
                   Back to Results
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};
