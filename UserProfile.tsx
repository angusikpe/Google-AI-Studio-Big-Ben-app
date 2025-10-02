import React, { useState, useEffect } from 'react';
import type { User } from 'firebase/auth';
import type { Booking, FirebaseTimestamp } from '../firebase/models';
import { getUserBookings, cancelBooking } from '../firebase/client';

interface UserProfileProps {
  user: User;
  onBack: () => void;
}

const formatTimestamp = (timestamp: FirebaseTimestamp, includeTime = false): string => {
  if (!timestamp) return 'N/A';
  const date = new Date(timestamp.seconds * 1000);
  const options: Intl.DateTimeFormatOptions = { 
      weekday: 'short', month: 'long', day: 'numeric',
  };
  if (includeTime) {
      options.hour = 'numeric';
      options.minute = '2-digit';
      options.hour12 = true;
  }
  return date.toLocaleString('en-US', options);
};

const BookingCard: React.FC<{ booking: Booking, onCancel: (id: string) => void }> = ({ booking, onCancel }) => {
    const isPast = booking.tripDetails.departureDatetime.seconds * 1000 < Date.now();
    const isCancelled = booking.status === 'cancelled';

    return (
        <div className={`bg-white rounded-lg shadow-md p-4 border-l-4 ${isCancelled ? 'border-red-500' : (isPast ? 'border-gray-400' : 'border-green-500')}`}>
            <div className="flex justify-between items-start">
                <div>
                    <p className="font-bold text-lg">{booking.tripDetails.originCity} &rarr; {booking.tripDetails.destinationCity}</p>
                    <p className="text-sm text-gray-600">{formatTimestamp(booking.tripDetails.departureDatetime, true)}</p>
                    <p className="text-xs text-gray-500 mt-1 font-mono">Ref: {booking.bookingReference}</p>
                </div>
                <div className="text-right">
                    {isCancelled ? (
                         <span className="font-bold text-red-500">Cancelled</span>
                    ) : (
                         <span className={`font-bold ${isPast ? 'text-gray-500' : 'text-green-600'}`}>{isPast ? 'Completed' : 'Upcoming'}</span>
                    )}
                   
                    <p className="text-lg font-bold text-primary">${booking.totalAmount.toFixed(2)}</p>
                </div>
            </div>
            {!isPast && !isCancelled && (
                <div className="text-right mt-4">
                    <button 
                        onClick={() => onCancel(booking.id)}
                        className="text-sm font-semibold text-red-600 hover:underline"
                    >
                        Cancel Booking
                    </button>
                </div>
            )}
        </div>
    )
}

export const UserProfile: React.FC<UserProfileProps> = ({ user, onBack }) => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBookings = async () => {
    setIsLoading(true);
    try {
      const userBookings = await getUserBookings(user.uid);
      setBookings(userBookings);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [user]);

  const handleCancelBooking = async (bookingId: string) => {
    if (window.confirm('Are you sure you want to cancel this booking? This action cannot be undone.')) {
        try {
            await cancelBooking(bookingId);
            // Refetch bookings to update the UI
            fetchBookings();
        } catch (err: any) {
            alert(`Cancellation failed: ${err.message}`);
        }
    }
  };

  const upcomingBookings = bookings.filter(b => b.tripDetails.departureDatetime.seconds * 1000 >= Date.now());
  const pastBookings = bookings.filter(b => b.tripDetails.departureDatetime.seconds * 1000 < Date.now());

  return (
    <div className="bg-white rounded-xl shadow-2xl p-6 md:p-8 text-dark animate-fade-in max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6 border-b pb-4">
          <h2 className="text-3xl font-bold">My Bookings</h2>
          <button onClick={onBack} className="font-semibold text-primary hover:underline">
            &larr; Back to Search
          </button>
      </div>
      
      {isLoading && <p>Loading your bookings...</p>}
      {error && <p className="text-red-500">Error: {error}</p>}
      
      {!isLoading && !error && (
        <>
            <div>
                <h3 className="text-xl font-bold mb-4">Upcoming Trips</h3>
                {upcomingBookings.length > 0 ? (
                    <div className="space-y-4">
                        {upcomingBookings.map(b => <BookingCard key={b.id} booking={b} onCancel={handleCancelBooking} />)}
                    </div>
                ) : (
                    <p className="text-gray-600">You have no upcoming trips.</p>
                )}
            </div>
            <div className="mt-8">
                <h3 className="text-xl font-bold mb-4">Past Trips</h3>
                 {pastBookings.length > 0 ? (
                    <div className="space-y-4">
                         {pastBookings.map(b => <BookingCard key={b.id} booking={b} onCancel={handleCancelBooking} />)}
                    </div>
                ) : (
                    <p className="text-gray-600">You have no past trip history.</p>
                )}
            </div>
        </>
      )}
    </div>
  );
};