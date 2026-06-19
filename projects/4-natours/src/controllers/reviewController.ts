import { Request, Response, NextFunction } from 'express';
import Review from '../models/reviewModel';
import * as factory from './handlerFactory';

export const setTourUserIds = (req: Request, _res: Response, next: NextFunction) => {
  const body = req.body as { tour?: string; user?: string };
  if (!body.tour) body.tour = req.params.tourId as string;
  if (!body.user) body.user = (req.user!.id as unknown) as string;
  next();
};

export const getAllReviews = factory.getAll(Review);
export const getReview = factory.getOne(Review);
export const createReview = factory.createOne(Review);
export const updateReview = factory.updateOne(Review);
export const deleteReview = factory.deleteOne(Review);
