import { Document } from 'mongoose';

export interface IReview {
  customerId: string;
  rating: number;
  comment: string;
  type: 'hotel' | 'tour';
  objectId: string;
  bookingId: string;
}

export interface IReviewDocument extends IReview, Document {
  _id: string;
  createdAt: Date;
}
