import { Request, Response, NextFunction } from 'express';
import Tour from '../models/tourModel';
import User from '../models/userModel';
import Booking from '../models/bookingModel';
import catchAsync from '../utils/catchAsync';
import AppError from '../utils/appError';

export const getOverview = catchAsync(async (_req: Request, res: Response, _next: NextFunction) => {
  const tours = await Tour.find();
  res.status(200).render('overview', { title: 'All Tours', tours });
});

export const getTour = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    select: 'review rating user'
  });

  if (!tour) {
    return next(new AppError('There is no tour with that name.', 404));
  }

  res.status(200).render('tour', { title: `${tour.name} Tour`, tour });
});

export const getLoginForm = (_req: Request, res: Response) => {
  res.status(200).render('login', { title: 'Log into your account' });
};

export const getAccount = (_req: Request, res: Response) => {
  res.status(200).render('account', { title: 'Your account' });
};

export const getMyTours = catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
  const bookings = await Booking.find({ user: req.user!.id });
  const tourIds = bookings.map(booking => booking.tour);
  const tours = await Tour.find({ _id: { $in: tourIds } });
  res.status(200).render('overview', { title: 'My Tours', tours });
});

export const updateUserData = catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
  const body = req.body as { name: string; email: string };
  const updatedUser = await User.findByIdAndUpdate(
    req.user!.id,
    { name: body.name, email: body.email },
    { new: true, runValidators: true }
  );

  res.status(200).render('account', { title: 'Your account', user: updatedUser });
});
