/**
 * NOTE: This file contains REAL Firebase Cloud Functions logic.
 * It requires proper setup with `firebase-functions` and `firebase-admin` SDKs,
 * and environment variables for secret keys (e.g., Paystack).
 * The mock client (`client.ts`) is used for local UI development.
 */

/*
// main index.js or index.ts for Firebase Functions

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const axios = require('axios');
const crypto = require('crypto');

admin.initializeApp();
const db = admin.firestore();

const PAYSTACK_SECRET_KEY = functions.config().paystack.secret;
// ... (other payment functions from before)


// 3. Function to get a user's bookings
exports.getUserBookings = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'You must be logged in to view bookings.');
  }

  const userId = context.auth.uid;

  try {
    const bookingsSnapshot = await db.collection('bookings').where('userId', '==', userId).orderBy('createdAt', 'desc').get();
    const bookings = [];
    bookingsSnapshot.forEach(doc => {
      bookings.push({ id: doc.id, ...doc.data() });
    });
    return bookings;
  } catch (error) {
    console.error("Error fetching user bookings:", error);
    throw new functions.https.HttpsError('internal', 'Could not retrieve bookings.');
  }
});


// 4. Function to cancel a booking
exports.cancelBooking = functions.https.onCall(async (data, context) => {
  const { bookingId } = data;

  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'You must be logged in.');
  }
  if (!bookingId) {
    throw new functions.https.HttpsError('invalid-argument', 'Booking ID is required.');
  }

  const userId = context.auth.uid;
  const bookingRef = db.collection('bookings').doc(bookingId);

  try {
    await db.runTransaction(async (transaction) => {
      const bookingDoc = await transaction.get(bookingRef);

      if (!bookingDoc.exists) {
        throw new Error('Booking not found.');
      }
      
      const bookingData = bookingDoc.data();

      if (bookingData.userId !== userId) {
        throw new functions.https.HttpsError('permission-denied', 'You are not authorized to cancel this booking.');
      }
      
      if (bookingData.status === 'cancelled') {
        throw new functions.https.HttpsError('already-exists', 'This booking has already been cancelled.');
      }
      
      // Update booking status to cancelled
      transaction.update(bookingRef, { status: 'cancelled' });

      // Make seats available again on the trip
      const tripRef = db.collection('trips').doc(bookingData.tripId);
      const cancelledSeatNumbers = bookingData.seats.map(s => s.seatNumber);
      
      transaction.update(tripRef, {
        seatsAvailable: admin.firestore.FieldValue.increment(cancelledSeatNumbers.length),
        bookedSeats: admin.firestore.FieldValue.arrayRemove(...cancelledSeatNumbers)
      });
    });

    return { success: true, message: 'Booking cancelled successfully.' };

  } catch (error) {
    console.error('Cancellation failed:', error);
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    throw new functions.https.HttpsError('internal', 'An error occurred while cancelling the booking.');
  }
});

*/