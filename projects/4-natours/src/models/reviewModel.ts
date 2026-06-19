import mongoose, { Document, Model, Schema } from 'mongoose';
import Tour from './tourModel';

export interface IReview extends Document {
  review: string;
  rating: number;
  createdAt: Date;
  tour: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
}

interface IReviewModel extends Model<IReview> {
  calcAverageRatings(tourId: mongoose.Types.ObjectId): Promise<void>;
}

const reviewSchema = new Schema<IReview>(
  {
    review: {
      type: String,
      required: [true, 'Review can not be empty!']
    },
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    createdAt: {
      type: Date,
      default: Date.now()
    },
    tour: {
      type: Schema.Types.ObjectId,
      ref: 'Tour',
      required: [true, 'Review must belong to a tour.']
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a user.']
    }
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

reviewSchema.pre(/^find/, function (this: mongoose.Query<unknown, unknown>, next) {
  this.populate({
    path: 'user',
    select: 'name photo'
  });
  next();
});

reviewSchema.statics.calcAverageRatings = async function (tourId: mongoose.Types.ObjectId) {
  const stats = await this.aggregate([
    { $match: { tour: tourId } },
    {
      $group: {
        _id: '$tour',
        numRatings: { $sum: 1 },
        avgRating: { $avg: '$rating' }
      }
    }
  ]);

  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: stats[0].numRatings,
      ratingsAverage: stats[0].avgRating
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5
    });
  }
};

reviewSchema.post('save', function (this: IReview) {
  (this.constructor as IReviewModel).calcAverageRatings(this.tour);
});

reviewSchema.pre(/^findOneAnd/, async function (this: mongoose.Query<unknown, unknown> & { doc?: IReview }, next) {
  this.doc = (await this.findOne()) as IReview;
  next();
});

// Bug fix: changed from pre to post so it runs after the update is persisted
reviewSchema.post(/^findOneAnd/, async function (this: mongoose.Query<unknown, unknown> & { doc?: IReview }) {
  if (this.doc) {
    await (this.doc.constructor as IReviewModel).calcAverageRatings(this.doc.tour);
  }
});

const Review = mongoose.model<IReview, IReviewModel>('Review', reviewSchema);

export default Review;
