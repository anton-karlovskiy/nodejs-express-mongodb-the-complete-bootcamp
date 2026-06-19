declare const Stripe: (key: string) => { redirectToCheckout: (opts: { sessionId: string }) => Promise<void> };

import axios from 'axios';
import { showAlert } from './alerts';

const stripe = Stripe('pk_test_');

export const bookTour = async (tourId: string): Promise<void> => {
  try {
    const session = await axios(`/api/v1/bookings/checkout-session/${tourId}`);
    await stripe.redirectToCheckout({ sessionId: session.data.session.id });
  } catch (err) {
    console.log(err);
    showAlert('error', String(err));
  }
};
