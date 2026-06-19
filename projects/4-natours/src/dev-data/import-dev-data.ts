import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Tour from '../models/tourModel';
import Review from '../models/reviewModel';
import User from '../models/userModel';

dotenv.config({ path: path.join(__dirname, '../../config.env') });

const DB = process.env.DATABASE!.replace('<PASSWORD>', process.env.DATABASE_PASSWORD!);

mongoose.connect(DB).then(() => console.log('DB connection successful!'));

const dataDir = path.join(__dirname, '../../dev-data/data');
const tours = JSON.parse(fs.readFileSync(path.join(dataDir, 'tours.json'), 'utf-8'));
const users = JSON.parse(fs.readFileSync(path.join(dataDir, 'users.json'), 'utf-8'));
const reviews = JSON.parse(fs.readFileSync(path.join(dataDir, 'reviews.json'), 'utf-8'));

const importData = async () => {
  try {
    await Tour.create(tours);
    await User.create(users, { validateBeforeSave: false } as object);
    await Review.create(reviews);
    console.log('Data successfully loaded!');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

const deleteData = async () => {
  try {
    await Tour.deleteMany();
    await User.deleteMany();
    await Review.deleteMany();
    console.log('Data successfully deleted!');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}

console.log(process.argv);
