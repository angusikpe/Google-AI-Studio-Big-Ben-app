import type { BookingQuery } from '../types';
import type { Trip, FirebaseTimestamp, Booking } from './models';

// This is a MOCK implementation of the Firebase client for UI development.
// In a real app, this would be replaced with actual Firebase SDK calls.

// --- MOCK AUTH ---
const mockUser = {
  uid: 'mock-user-123',
  email: 'test@example.com',
  displayName: 'Test User',
};

let authStateListener: ((user: any) => void) | null = null;
let currentUser: any = null;

const auth = {
  // Mock object to satisfy TypeScript
};

const onAuthStateChanged = (auth: any, listener: (user: any) => void) => {
  authStateListener = listener;
  // Simulate initial state (logged out)
  setTimeout(() => listener(currentUser), 100);
  return () => { authStateListener = null; }; // Unsubscribe
};

const signInWithPopup = async (auth: any, provider: any) => {
  return new Promise(resolve => {
    setTimeout(() => {
      currentUser = mockUser;
      if (authStateListener) authStateListener(currentUser);
      resolve({ user: currentUser });
    }, 500);
  });
};

const createUserWithEmailAndPassword = async (auth: any, email: string, pass: string) => {
  return signInWithPopup(auth, null);
};

const signInWithEmailAndPassword = async (auth: any, email: string, pass: string) => {
   if (pass !== 'password') throw new Error("Mock Auth: Invalid password. Use 'password'.");
   return signInWithPopup(auth, null);
};

const signOut = async (auth: any) => {
  return new Promise<void>(resolve => {
    setTimeout(() => {
      currentUser = null;
      if (authStateListener) authStateListener(null);
      resolve();
    }, 200);
  });
};

const googleProvider = {}; // Mock provider

export { 
  auth, 
  onAuthStateChanged,
  googleProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
};

// --- MOCK UTILS ---
const createTimestamp = (date: Date): FirebaseTimestamp => ({
  seconds: Math.floor(date.getTime() / 1000),
  nanoseconds: 0,
});

// --- MOCK DATA ---
let MOCK_USER_BOOKINGS: Booking[] = [
    {
      id: 'BBE-PAST1', bookingReference: 'BBE-PAST1', userId: 'mock-user-123', tripId: 'trip-past', status: 'confirmed',
      tripDetails: {
        originCity: 'Heathrow Airport (LHR)', destinationCity: 'Central London',
        departureDatetime: createTimestamp(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)),
        arrivalDatetime: createTimestamp(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 + 90 * 60 * 1000)),
      },
      passengerDetails: { fullName: 'Test User', email: 'test@example.com', phone: '1234567890' },
      seats: [{ seatId: '2', seatNumber: '2', passengerName: 'Test User' }],
      totalAmount: 25.50, payment: { id: 'py_past1', status: 'success', amount: 25.50, currency: 'GBP', paidAt: createTimestamp(new Date()) },
      createdAt: createTimestamp(new Date(Date.now() - 8 * 24 * 60 * 60 * 1000)),
    },
    {
      id: 'BBE-FUTURE1', bookingReference: 'BBE-FUTURE1', userId: 'mock-user-123', tripId: 'trip-future', status: 'confirmed',
      tripDetails: {
        originCity: 'Gatwick Airport (LGW)', destinationCity: 'Canary Wharf',
        departureDatetime: createTimestamp(new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)),
        arrivalDatetime: createTimestamp(new Date(Date.now() + 14 * 24 * 60 * 60 * 1000 + 120 * 60 * 1000)),
      },
      passengerDetails: { fullName: 'Test User', email: 'test@example.com', phone: '1234567890' },
      seats: [{ seatId: '4', seatNumber: '4', passengerName: 'Test User' }, { seatId: '5', seatNumber: '5', passengerName: 'Test User' }],
      totalAmount: 51.00, payment: { id: 'py_future1', status: 'success', amount: 51.00, currency: 'GBP', paidAt: createTimestamp(new Date()) },
      createdAt: createTimestamp(new Date()),
    }
];


// --- MOCK FUNCTIONS ---
const createDummyTrips = (query: BookingQuery): Trip[] => {
  const trips: Trip[] = [];
  const baseDate = new Date(query.date + 'T00:00:00');
  for (let i = 0; i < 5; i++) {
    const departureTime = new Date(baseDate);
    departureTime.setHours(8 + i * 2, 0, 0, 0);
    const arrivalTime = new Date(departureTime);
    arrivalTime.setHours(arrivalTime.getHours() + 2, 30, 0, 0);
    trips.push({
      id: `trip-${i + 1}`,
      originCity: query.from.trim(),
      destinationCity: query.to.trim(),
      departureDatetime: createTimestamp(departureTime),
      arrivalDatetime: createTimestamp(arrivalTime),
      vehicleType: 'Minibus',
      seatsAvailable: 8,
      baseFare: 25.50,
      stops: 0,
      amenities: ['WiFi', 'Air Conditioning'],
      bookedSeats: ['1', '3'],
    });
  }
  return trips;
};

export const searchTrips = async (query: BookingQuery): Promise<Trip[]> => {
  console.log('Searching (mock):', query);
  return new Promise(resolve => {
    setTimeout(() => {
      if (query.from.trim().toLowerCase() === query.to.trim().toLowerCase()) {
        resolve([]);
      } else {
        resolve(createDummyTrips(query));
      }
    }, 1000);
  });
};


export const createPaymentLink = async (paymentData: any): Promise<{ authorization_url: string }> => {
    console.log("Creating mock payment link for:", paymentData);
    return new Promise(resolve => {
        setTimeout(() => {
            const transactionRef = `MOCK_TRX_${Date.now()}`;
            const mockBooking: Booking = {
                id: transactionRef,
                bookingReference: `BBE-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
                userId: paymentData.user?.uid || null,
                tripId: paymentData.tripId,
                status: 'confirmed',
                tripDetails: {
                    originCity: "Mock Origin",
                    destinationCity: "Mock Destination",
                    departureDatetime: createTimestamp(new Date()),
                    arrivalDatetime: createTimestamp(new Date(Date.now() + 2 * 60 * 60 * 1000))
                },
                passengerDetails: paymentData.passenger,
                seats: paymentData.seats.map((s: string) => ({ seatId: s, seatNumber: s, passengerName: paymentData.passenger.fullName })),
                totalAmount: paymentData.amount,
                payment: { id: transactionRef, status: 'success', amount: paymentData.amount, currency: 'GBP', paidAt: createTimestamp(new Date()) },
                createdAt: createTimestamp(new Date()),
            };
            localStorage.setItem(transactionRef, JSON.stringify(mockBooking));
            const callbackUrl = `${window.location.origin}${window.location.pathname}?trxref=${transactionRef}`;
            resolve({ authorization_url: callbackUrl });
        }, 1500);
    });
};

export const getBookingByReference = async (ref: string): Promise<Booking | null> => {
    console.log("Getting mock booking for ref:", ref);
    return new Promise(resolve => {
        setTimeout(() => {
            const bookingData = localStorage.getItem(ref);
            if (bookingData) {
                resolve(JSON.parse(bookingData));
            } else {
                resolve(null);
            }
        }, 500);
    });
};

export const getUserBookings = async (userId: string): Promise<Booking[]> => {
    console.log("Getting mock bookings for user:", userId);
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(MOCK_USER_BOOKINGS.filter(b => b.userId === userId));
        }, 800);
    });
};

export const cancelBooking = async (bookingId: string): Promise<{ success: boolean }> => {
    console.log("Cancelling mock booking:", bookingId);
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const bookingIndex = MOCK_USER_BOOKINGS.findIndex(b => b.id === bookingId);
            if (bookingIndex > -1) {
                MOCK_USER_BOOKINGS[bookingIndex].status = 'cancelled';
                resolve({ success: true });
            } else {
                reject(new Error("Booking not found"));
            }
        }, 1000);
    });
};