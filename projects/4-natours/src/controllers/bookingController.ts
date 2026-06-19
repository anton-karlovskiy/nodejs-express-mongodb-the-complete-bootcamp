import Stripe from 'stripe';
import { Request, Response, NextFunction } from 'express';
import Tour from '../models/tourModel';
import Booking from '../models/bookingModel';
import catchAsync from '../utils/catchAsync';
import * as factory from './handlerFactory';
import AppError from '../utils/appError';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export const getCheckoutSession = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const tourId = req.params.tourId as string;
  const tour = await Tour.findById(tourId);
  if (!tour) return next(new AppError('No tour found with that ID', 404));

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    success_url: `${req.protocol}://${req.get('host')}/?tour=${tourId}&user=${req.user!.id}&price=${tour.price}`,
    cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
    customer_email: req.user!.email,
    client_reference_id: tourId,
    line_items: [
      {
        price_data: {
          currency: 'usd',
          unit_amount: tour.price * 100,
          product_data: {
            name: `${tour.name} Tour`,
            description: tour.summary,
            images: [`https://www.natours.dev/img/tours/${tour.imageCover}`]
          }
        },
        quantity: 1
      }
    ]
  });

  res.status(200).json({ status: 'success', session });
});

export const createBookingCheckout = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { tour, user, price } = req.query as { tour?: string; user?: string; price?: string };

  if (!tour || !user || !price) return next();
  await Booking.create({ tour, user, price: Number(price) });

  res.redirect(req.originalUrl.split('?')[0]);
});

export const createBooking = factory.createOne(Booking);
export const getBooking = factory.getOne(Booking);
export const getAllBookings = factory.getAll(Booking);
export const updateBooking = factory.updateOne(Booking);
export const deleteBooking = factory.deleteOne(Booking);
