import { Document} from 'mongoose';

export interface IProductReview {
  productId: string;
  customerId: string;
  review: number;
  description: string;
  info: any;
}

export interface IProductReviewDocument extends IProductReview, Document {
  _id: string;
  createdAt: Date;
  modifiedAt: Date;
}