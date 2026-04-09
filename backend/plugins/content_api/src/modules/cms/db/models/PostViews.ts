import { Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import {
  IPostView,
  IPostViewCount,
  IPostViewDocument,
  POST_VIEW_RETENTION_DAYS,
} from '@/cms/@types/postView';
import { postViewSchema } from '@/cms/db/definitions/postViews';

export interface IPostViewModel extends Model<IPostViewDocument> {
  incrementDailyCount(
    postId: string,
    clientPortalId: string,
    viewedAt?: Date,
  ): Promise<IPostViewDocument>;
  getRecentViewCounts(
    clientPortalId: string,
    since: Date,
  ): Promise<IPostViewCount[]>;
  createDoc(doc: IPostView): Promise<IPostViewDocument>;
}

export { POST_VIEW_RETENTION_DAYS };

const getDayStartUtc = (date: Date) =>
  new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );

export const loadPostViewClass = (models: IModels) => {
  class PostViews {
    public static async createDoc(doc: IPostView) {
      return models.PostViews.create(doc);
    }

    public static async incrementDailyCount(
      postId: string,
      clientPortalId: string,
      viewedAt = new Date(),
    ) {
      const dayStart = getDayStartUtc(viewedAt);

      return models.PostViews.findOneAndUpdate(
        { postId, clientPortalId, viewedAt: dayStart },
        {
          $inc: { count: 1 },
          $setOnInsert: { postId, clientPortalId, viewedAt: dayStart },
        },
        { upsert: true, new: true },
      );
    }

    public static async getRecentViewCounts(
      clientPortalId: string,
      since: Date,
    ) {
      const results = await models.PostViews.aggregate([
        {
          $match: {
            clientPortalId,
            viewedAt: { $gte: getDayStartUtc(since) },
          },
        },
        {
          $group: {
            _id: '$postId',
            recentViewCount: { $sum: '$count' },
          },
        },
        {
          $sort: {
            recentViewCount: -1,
          },
        },
      ]);

      return results.map((item) => ({
        postId: item._id,
        recentViewCount: item.recentViewCount,
      }));
    }
  }

  postViewSchema.loadClass(PostViews);
  return postViewSchema;
};
