import multer from 'multer';
import sharp from 'sharp';
import { Request, Response, NextFunction } from 'express';
import User from '../models/userModel';
import catchAsync from '../utils/catchAsync';
import AppError from '../utils/appError';
import * as factory from './handlerFactory';

const multerStorage = multer.memoryStorage();

const multerFilter = (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image! Please upload only images.', 400) as unknown as null, false);
  }
};

const upload = multer({ storage: multerStorage, fileFilter: multerFilter });

export const uploadUserPhoto = upload.single('photo');

export const resizeUserPhoto = catchAsync(async (req: Request, _res: Response, next: NextFunction) => {
  if (!req.file) return next();

  req.file.filename = `user-${req.user!.id}-${Date.now()}.jpeg`;

  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`);

  next();
});

const filterObj = (obj: Record<string, unknown>, ...allowedFields: string[]): Record<string, unknown> => {
  const newObj: Record<string, unknown> = {};
  Object.keys(obj).forEach(el => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

export const getMe = (req: Request, _res: Response, next: NextFunction) => {
  req.params.id = req.user!.id as string;
  next();
};

export const updateMe = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const body = req.body as { password?: string; passwordConfirm?: string; name?: string; email?: string };

  if (body.password || body.passwordConfirm) {
    return next(
      new AppError('This route is not for password updates. Please use /updateMyPassword.', 400)
    );
  }

  const filteredBody = filterObj(req.body as Record<string, unknown>, 'name', 'email');
  if (req.file) filteredBody.photo = req.file.filename;

  const updatedUser = await User.findByIdAndUpdate(req.user!.id, filteredBody, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    status: 'success',
    data: { user: updatedUser }
  });
});

export const deleteMe = catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
  await User.findByIdAndUpdate(req.user!.id, { active: false });
  res.status(204).json({ status: 'success', data: null });
});

export const createUser = (_req: Request, res: Response) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not defined! Please use /signup instead.'
  });
};

export const getUser = factory.getOne(User);
export const getAllUsers = factory.getAll(User);
export const updateUser = factory.updateOne(User);
export const deleteUser = factory.deleteOne(User);
