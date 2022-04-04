import {
  feedSchema,
  TExmThank,
  thankSchema,
  IFeedDocument,
  IThankDocument
} from './definitions/exm';

import { Model } from 'mongoose';

export const loadFeedClass = models => {
  class Feed {
    public static async getExmFeed(_id: string) {
      const exm = await models.ExmFeed.findOne({ _id });

      if (!exm) {
        throw new Error('Feed not found');
      }

      return exm;
    }

    public static async removeFeeds(ids: string[]) {
      await models.ExmFeed.deleteMany({
        _id: { $in: ids }
      });
    }

    /*
     * Create new exm
     */
    public static async createExmFeed(doc: any, user: any) {
      const exm = await models.ExmFeed.create({
        createdBy: user._id,
        createdAt: doc.createdAt || new Date(),
        ...doc
      });

      return exm;
    }

    /*
     * Update exm
     */
    public static async updateExmFeed(_id: string, doc: TExmThank, user: any) {
      await models.ExmFeed.updateOne(
        { _id },
        {
          $set: {
            updatedBy: user._id,
            updatedAt: new Date(),
            ...doc
          }
        }
      );

      return models.ExmFeed.findOne({ _id });
    }

    /*
     * Remove exm
     */
    public static async removeExmFeed(_id: string) {
      const exmObj = await models.ExmFeed.findOne({ _id });

      if (!exmObj) {
        throw new Error(`Feed not found with id ${_id}`);
      }

      return exmObj.remove();
    }
  }
  feedSchema.loadClass(Feed);
  return feedSchema;
};
export interface IFeedModel extends Model<IFeedDocument> {
  getExmFeed(_id: string);
  removeFeeds(ids: string[]);
  createExmFeed(doc: any, user: any);
  updateExmFeed(_id: string, doc: TExmThank, user: any);
  removeExmFeed(_id: string);
}

export const loadExmThankClass = models => {
  class ExmThank {
    public static async getThank(_id: string) {
      const thank = await models.ExmThanks.findOne({ _id });

      if (!thank) {
        throw new Error('Thank you not found');
      }

      return thank;
    }

    /*
     * Create new thank
     */
    public static async createThank(doc: TExmThank, user: any) {
      const thank = await models.ExmThanks.create({
        createdBy: user._id,
        createdAt: new Date(),
        ...doc
      });

      return thank;
    }

    /*
     * Update thank
     */
    public static async updateThank(_id: string, doc: TExmThank, user: any) {
      await models.ExmThanks.updateOne(
        { _id },
        {
          $set: {
            updatedBy: user._id,
            updatedAt: new Date(),
            ...doc
          }
        }
      );

      return models.ExmThanks.findOne({
        _id
      });
    }

    /*
     * Remove thank
     */
    public static async removeThank(_id: string) {
      const thankObj = await models.ExmThanks.findOne({ _id });

      if (!thankObj) {
        throw new Error(`Thank you not found with id ${_id}`);
      }

      return thankObj.remove();
    }
  }
  thankSchema.loadClass(ExmThank);
  return thankSchema;
};
export interface IThankModel extends Model<IThankDocument> {
  getThank(_id: string);
  createThank(doc: TExmThank, user: any);
  updateThank(_id: string, doc: TExmThank, user: any);
  removeThank(_id: string);
}
