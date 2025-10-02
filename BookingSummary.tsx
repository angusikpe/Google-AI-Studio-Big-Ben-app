import React, { useState, useEffect } from 'react';
import type { Trip } from '../firebase/models';
import type { PassengerDetails } from '../types';
import { User } from 'firebase/auth';

interface BookingSummaryProps {
  trip: Trip;
  selectedSeats: string[];
  user: User | null;
  onProceed: (details: PassengerDetails) => void;
  onBack: () => void;
}

export const BookingSummary: React.FC<BookingSummaryProps> = ({ trip, selectedSeats, user, onProceed, onBack }) => {
  const [passengerDetails, setPassengerDetails] = useState<PassengerDetails>({
    fullName: '',
    email: '',
    phone: '',
  });

  useEffect(() => {
    if (user) {
      setPassengerDetails({
        fullName: user.displayName || '',
        email: user.email || '',
        phone: user.phoneNumber || '',
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassengerDetails({ ...passengerDetails, [e.target.name]: e.target.value });
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onProceed(passengerDetails);
  }

  const totalFare = trip.baseFare * selectedSeats.length;

  return (
    <div className="bg-white rounded-xl shadow-2xl p-6 md:p-8 text-dark animate-fade-in max-w-3xl mx-auto">
      <h2 className="text-3xl font-bold mb-6 text-center">Booking Summary</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h3 className="text-xl font-bold mb-4 border-b pb-2">Trip Details</h3>
          <div className="space-y-2 text-gray-700">
            <p><strong>From:</strong> {trip.originCity}</p>
            <p><strong>To:</strong> {trip.destinationCity}</p>
            <p><strong>Seats:</strong> <span className="font-semibold text-primary">{selectedSeats.join(', ')}</span></p>
            <p><strong>Total Passengers:</strong> {selectedSeats.length}</p>
          </div>
           <div className="mt-6 pt-4 border-t">
              <p className="flex justify-between font-bold text-lg">
                  <span>Total Price</span>
                  <span>${totalFare.toFixed(2)}</span>
              </p>
           </div>
        </div>

        <div>
           <h3 className="text-xl font-bold mb-4 border-b pb-2">Passenger Information</h3>
           <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">Full Name</label>
                <input type="text" name="fullName" id="fullName" value={passengerDetails.fullName} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"/>
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
                <input type="email" name="email" id="email" value={passengerDetails.email} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"/>
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone Number</label>
                <input type="tel" name="phone" id="phone" value={passengerDetails.phone} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"/>
              </div>
              <div className="pt-4 space-y-3">
                 <button type="submit" className="w-full bg-green-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-green-700 transition-colors">
                    Proceed to Payment
                 </button>
                 <button type="button" onClick={onBack} className="w-full bg-transparent text-primary font-bold py-3 px-8 rounded-lg hover:bg-gray-100 border border-primary">
                    Back to Seat Selection
                 </button>
              </div>
           </form>
        </div>
      </div>
    </div>
  );
};
