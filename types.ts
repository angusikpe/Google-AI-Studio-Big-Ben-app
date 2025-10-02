export interface BookingQuery {
  tripType: 'one-way' | 'roundtrip';
  from: string;
  to: string;
  date: string;
  returnDate?: string;
  passengers: number;
}

export interface PassengerDetails {
  fullName: string;
  email: string;
  phone: string;
}
