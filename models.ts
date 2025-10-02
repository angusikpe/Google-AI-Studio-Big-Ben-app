export interface FirebaseTimestamp {
  seconds: number;
  nanoseconds: number;
}

export interface Trip {
  id: string;
  originCity: string;
  destinationCity: string;
  departureDatetime: FirebaseTimestamp;
  arrivalDatetime: FirebaseTimestamp;
  vehicleType: string;
  seatsAvailable: number;
  baseFare: number;
  stops: number;
  amenities: string[];
  bookedSeats: string[];
}

export interface BookingSeat {
  seatId: string; // Corresponds to the seat document ID
  seatNumber: string; // e.g., "1A", "2B"
  passengerName: string;
}

export interface Payment {
  id: string; // Paystack transaction ID
  status: 'success' | 'failed' | 'pending';
  amount: number;
  currency: 'GBP';
  paidAt: FirebaseTimestamp;
}

export interface Booking {
  id: string; // Document ID
  bookingReference: string; // User-facing reference (e.g., BBE-XYZ789)
  userId: string | null; // Firebase Auth UID
  tripId: string;
  status: 'confirmed' | 'cancelled';
  tripDetails: { // Denormalized for easy display
    originCity: string;
    destinationCity: string;
    departureDatetime: FirebaseTimestamp;
    arrivalDatetime: FirebaseTimestamp;
  };
  passengerDetails: {
    fullName: string;
    email: string;
    phone: string;
  };
  seats: BookingSeat[];
  totalAmount: number;
  payment: Payment;
  createdAt: FirebaseTimestamp;
}