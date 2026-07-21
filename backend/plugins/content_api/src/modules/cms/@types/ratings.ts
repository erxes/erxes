import { Document, Model } from 'mongoose';

export type PostRatingStatus = 'pending' | 'approved' | 'rejected';

export interface IPostRating {
  postId: string;
  clientPortalId: string;
  authorId: string;
  rating: number;
  status: PostRatingStatus;
}

export interface IPostRatingDocument extends IPostRating, Document {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IPostRatingBucket {
  rating: number;
  count: number;
}

export interface IPostRatingSummary {
  averageRating: number;
  totalCount: number;
  distribution: IPostRatingBucket[];
}

export interface IPostRatingOverview {
  enabled: boolean;
  summary: IPostRatingSummary;
  myRating: IPostRatingDocument | null;
}

export interface IPostRatingModel extends Model<IPostRatingDocument> {
  setRating(doc: IPostRating): Promise<IPostRatingDocument>;
  changeStatus(
    _id: string,
    status: PostRatingStatus,
  ): Promise<IPostRatingDocument>;
  deleteRating(filter: {
    postId: string;
    clientPortalId: string;
    authorId: string;
  }): Promise<{ deletedCount?: number }>;
  getSummary(
    postId: string,
    clientPortalId: string,
  ): Promise<IPostRatingSummary>;
}
