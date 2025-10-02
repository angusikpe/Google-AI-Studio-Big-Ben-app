import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { BookingForm } from './components/BookingForm';
import { TripResults } from './components/ShuttleResults';
import { SeatSelection } from './components/SeatSelection';
import { AuthModal } from './components/AuthModal';
import { BookingSummary } from './components/BookingSummary';
import { BookingConfirmation } from './components/BookingConfirmation';
import { UserProfile } from './components/UserProfile';
import { WhyChooseUs } from './components/WhyChooseUs';
import { PopularRoutes } from './components/PopularRoutes';
import type { BookingQuery, PassengerDetails } from './types';
import type { Trip } from './firebase/models';
import { searchTrips, auth, createPaymentLink, onAuthStateChanged } from './firebase/client';
import type { User } from 'firebase/auth';

type Page = 'search' | 'results' | 'seats' | 'summary' | 'confirmation' | 'profile';

const App: React.FC = () => {
  const [page, setPage] = useState<Page>('search');
  const [bookingQuery, setBookingQuery] = useState<BookingQuery | null>(null);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [bookingReference, setBookingReference] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    // Handle auth state
    const unsubscribe = onAuthStateChanged(auth, user => {
      setCurrentUser(user);
      if (user) setIsAuthModalOpen(false);
    });

    // Handle payment callback
    const urlParams = new URLSearchParams(window.location.search);
    const paymentRef = urlParams.get('trxref');
    if (paymentRef) {
      setBookingReference(paymentRef);
      setPage('confirmation');
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
    
    return () => unsubscribe();
  }, []);

  const handleSearch = async (query: BookingQuery) => {
    setBookingQuery(query);
    setPage('results');
    setIsLoading(true);
    setError(null);
    try {
      const results = await searchTrips(query);
      setTrips(results);
    } catch (err) {
      setError('Sorry, we couldn\'t find any shuttles. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectTrip = (trip: Trip) => {
    setSelectedTrip(trip);
    setPage('seats');
  };

  const handleSeatsConfirmed = (seats: string[]) => {
    setSelectedSeats(seats);
    setPage('summary');
  };

  const handleProceedToPayment = async (passengerDetails: PassengerDetails) => {
    if (!selectedTrip || selectedSeats.length === 0) {
      setError("Something went wrong. Please start over.");
      return;
    }
    setIsLoading(true);
    try {
      const paymentData = {
        tripId: selectedTrip.id,
        seats: selectedSeats,
        amount: selectedTrip.baseFare * selectedSeats.length,
        passenger: passengerDetails,
        user: currentUser ? { uid: currentUser.uid, email: currentUser.email } : null
      };
      const { authorization_url } = await createPaymentLink(paymentData);
      window.location.href = authorization_url; // Redirect to Paystack
    } catch (err) {
       setError("Could not initiate payment. Please try again.");
       setIsLoading(false);
    }
  };
  
  const handleNewBooking = () => {
    setBookingQuery(null);
    setTrips([]);
    setSelectedTrip(null);
    setSelectedSeats([]);
    setBookingReference(null);
    setPage('search');
  };

  const handleGoToProfile = () => {
    setPage('profile');
  }

  const renderDynamicContent = () => {
    if (page === 'search') return null;

    if (isLoading) {
      return (
        <div className="text-center p-10">
          <div className="loader ease-linear rounded-full border-8 border-t-8 border-gray-200 h-32 w-32 mx-auto animate-spin border-t-primary"></div>
          <h2 className="text-2xl font-semibold mt-4 text-dark">
            {page === 'summary' ? 'Redirecting to payment...' : 'Finding shuttles...'}
          </h2>
        </div>
      );
    }

    if (error) {
       return <p className="text-center text-red-500 text-lg">{error}</p>
    }

    switch (page) {
      case 'results':
        if (!bookingQuery) return null;
        return (
            <div className="w-full max-w-4xl mx-auto">
                {trips.length > 0 ? (
                    <TripResults trips={trips} onBook={handleSelectTrip} searchQuery={bookingQuery} />
                ) : (
                    <div className="bg-white rounded-lg shadow-md p-8 text-center">
                        <h3 className="text-xl font-bold text-dark">No Shuttles Found</h3>
                        <p className="text-gray-600 mt-2">Try different search criteria.</p>
                    </div>
                )}
            </div>
        );
      case 'seats':
        if (!selectedTrip || !bookingQuery) return null;
        return <SeatSelection trip={selectedTrip} bookingQuery={bookingQuery} onConfirm={handleSeatsConfirmed} onBack={() => setPage('results')} />;
      case 'summary':
        if (!selectedTrip || !bookingQuery) return null;
        return <BookingSummary trip={selectedTrip} selectedSeats={selectedSeats} user={currentUser} onProceed={handleProceedToPayment} onBack={() => setPage('seats')} />;
      case 'confirmation':
        if (!bookingReference) return null;
        return <BookingConfirmation bookingReference={bookingReference} onNewBooking={handleNewBooking} />;
      case 'profile':
        if (!currentUser) {
            setPage('search'); // Should not happen if UI is correct
            return null;
        }
        return <UserProfile user={currentUser} onBack={handleNewBooking} />;
      default:
        return null;
    }
  };

  const showHero = page === 'search' || (page === 'results' && trips.length === 0);

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 font-sans">
      <Header 
        user={currentUser} 
        onAuthClick={() => setIsAuthModalOpen(true)} 
        onProfileClick={handleGoToProfile}
        onGoHome={handleNewBooking}
      />
      <main className="flex-grow">
          {showHero && (
            <div className="bg-primary">
              <div className="bg-blue-600 text-white text-center p-3 text-sm font-semibold">
                  <p>Exclusive offer: Earn 80,000 bonus points with the Big Ben Express Plus Card. <a href="#" className="font-bold underline">Pre-qualify now</a></p>
              </div>
              <div 
                className="bg-cover bg-center" 
                style={{backgroundImage: "linear-gradient(to bottom, rgba(0, 56, 118, 0.8), rgba(0, 56, 118, 1)), url('https://images.unsplash.com/photo-1529655683826-1c21ef242a5f?q=80&w=2850&auto=format&fit=crop')"}}
              >
                <div className="container mx-auto px-4 py-8 md:py-16 text-center text-white">
                  <h1 className="text-4xl md:text-6xl font-extrabold mb-8 tracking-tight">On time. Business class.</h1>
                  <div className="max-w-2xl mx-auto">
                      <BookingForm 
                          onSearch={handleSearch} 
                          initialQuery={bookingQuery || undefined} 
                          isUpdate={page !== 'search'} 
                      />
                  </div>
                  <a href="#" className="inline-block mt-8 text-white underline font-semibold">Updated bag fees</a>
                </div>
              </div>
            </div>
          )}
          
          {showHero && (
            <>
              <WhyChooseUs />
              <PopularRoutes onSearch={handleSearch} />
            </>
          )}

          <div className="container mx-auto px-4 py-12">
            {renderDynamicContent()}
          </div>
      </main>
      <Footer />
      {isAuthModalOpen && <AuthModal onClose={() => setIsAuthModalOpen(false)} />}
    </div>
  );
};

export default App;