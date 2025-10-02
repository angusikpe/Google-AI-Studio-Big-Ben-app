import React, { useState, useEffect } from 'react';
import type { Booking, FirebaseTimestamp } from '../firebase/models';
import { getBookingByReference } from '../firebase/client';

interface BookingConfirmationProps {
  bookingReference: string;
  onNewBooking: () => void;
}

const formatTimestamp = (timestamp: FirebaseTimestamp): string => {
  if (!timestamp) return 'N/A';
  const date = new Date(timestamp.seconds * 1000);
  return date.toLocaleString('en-US', { 
      weekday: 'short', month: 'short', day: 'numeric', 
      hour: 'numeric', minute: '2-digit', hour12: true 
  });
};

export const BookingConfirmation: React.FC<BookingConfirmationProps> = ({ bookingReference, onNewBooking }) => {
  const [booking, setBooking] = useState<Booking | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const result = await getBookingByReference(bookingReference);
        if (!result) {
          throw new Error('Could not find your booking. Please contact support.');
        }
        setBooking(result);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchBooking();
  }, [bookingReference]);

  if (isLoading) {
    return (
      <div className="text-center p-10">
        <div className="loader ease-linear rounded-full border-8 border-t-8 border-gray-200 h-24 w-24 mx-auto animate-spin"></div>
        <h2 className="text-xl font-semibold mt-4 text-dark">Finalizing your booking...</h2>
      </div>
    );
  }

  if (error) {
    return <p className="text-center text-red-500 text-lg">{error}</p>;
  }

  if (!booking) return null;

  return (
    <div className="bg-white rounded-xl shadow-2xl p-6 md:p-8 text-dark animate-fade-in max-w-3xl mx-auto">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-green-600 mb-2">Booking Confirmed!</h2>
        <p className="text-gray-600 mb-6">Your digital ticket is below. A copy has been sent to your email.</p>
        <div className="bg-primary text-white font-mono text-2xl tracking-widest rounded-lg p-4 inline-block">
          {booking.bookingReference}
        </div>
      </div>

      <div className="mt-8 border-t pt-6 space-y-4">
        <h3 className="text-xl font-bold">Digital Ticket</h3>
        <div className="bg-gray-50 p-6 rounded-lg border space-y-3">
          <div>
            <p className="text-sm text-gray-500">Passenger</p>
            <p className="font-semibold text-lg">{booking.passengerDetails.fullName}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Route</p>
            <p className="font-semibold text-lg">{booking.tripDetails.originCity} &rarr; {booking.tripDetails.destinationCity}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Departure</p>
            <p className="font-semibold text-lg">{formatTimestamp(booking.tripDetails.departureDatetime)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Seats</p>
            <p className="font-semibold text-lg">{booking.seats.map(s => s.seatNumber).join(', ')}</p>
          </div>
           <div className="pt-3 border-t">
             <p className="text-sm text-gray-500">Total Paid</p>
             <p className="font-bold text-xl text-primary">${booking.totalAmount.toFixed(2)}</p>
           </div>
        </div>
      </div>
       <button onClick={onNewBooking} className="mt-8 w-full bg-primary text-white font-bold py-3 px-8 rounded-lg hover:bg-blue-800 transition-colors">
          Make a New Booking
      </button>
    </div>
  );
};
