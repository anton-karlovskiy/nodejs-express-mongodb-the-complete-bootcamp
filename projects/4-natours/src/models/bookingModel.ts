import mongoose, { Document, Schema } from 'mongoose';

export interface IBooking extends Document {
  tour: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  price: number;
  createdAt: Date;
  paid: boolean;
}

const bookingSchema = new Schema<IBooking>({
  tour: {
    type: Schema.Types.ObjectId,
    ref: 'Tour',
    required: [true, 'Booking must belong to a Tour!']
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Booking must belong to a User!']
  },
  price: {
    type: Number,
    required: [true, 'Booking must have a price.']
  },
  createdAt: {
    type: Date,
    default: Date.now()
  },
  paid: {
    type: Boolean,
    default: true
  }
});

bookingSchema.pre(/^find/, function (this: mongoose.Query<unknown, unknown>, next) {
  this.populate('user').populate({
    path: 'tour',
    select: 'name'
  });
  next();
});

const Booking = mongoose.model<IBooking>('Booking', bookingSchema);

export default Booking;
