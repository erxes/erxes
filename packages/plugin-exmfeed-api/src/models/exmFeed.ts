import {
  feedSchema,
  TExmThank,
  thankSchema,
  IFeedDocument,
  IThankDocument,
} from './definitions/exm';
import { sendCoreMessage, sendInternalNotesMessage } from '../messageBroker';

import { Model } from 'mongoose';

export const loadFeedClass = (models) => {
  class Feed {
    public static async getExmFeed(models, _id: string) {
      const exm = await models.ExmFeed.findOne({ _id });

      if (!exm) {
        throw new Error('Feed not found');
      }

      return exm;
    }

    public static async removeFeeds(models, ids: string[]) {
      await sendInternalNotesMessage({
        subdomain: models.subdomain,
        action: 'removeInternalNotes',
        data: {
          contentType: 'feed',
          contentTypeId: ids,
        },
        defaultValue: {},
      });
      await sendCoreMessage({
        subdomain: models.subdomain,
        action: 'conformities.removeConformity',
        data: {
          mainType: 'feed',
          mainTypeId: ids,
        },
        defaultValue: [],
      });

      await models.ExmFeed.deleteMany({
        _id: { $in: ids },
      });
    }

    /*
     * Create new exm
     */
    public static async createExmFeed(models, doc: any, user: any) {
      const exm = await models.ExmFeed.create({
        createdBy: user._id,
        createdAt: doc.createdAt || new Date(),
        ...doc,
      });

      return exm;
    }

    /*
     * Update exm
     */
    public static async updateExmFeed(
      models,
      _id: string,
      doc: TExmThank,
      user: any
    ) {
      await models.ExmFeed.updateOne(
        { _id },
        {
          $set: {
            updatedBy: user._id,
            updatedAt: new Date(),
            ...doc,
          },
        }
      );

      return models.ExmFeed.findOne({ _id });
    }

    /*
     * Remove exm
     */
    public static async removeExmFeed(models, _id: string) {
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
  getExmFeed(models, _id: string);
  removeFeeds(models, ids: string[]);
  createExmFeed(models, doc: any, user: any);
  updateExmFeed(models, _id: string, doc: TExmThank, user: any);
  removeExmFeed(models, _id: string);
}

export const loadExmThankClass = (models) => {
  class ExmThank {
    public static async getThank(models, _id: string) {
      const thank = await models.ExmThanks.findOne({ _id });

      if (!thank) {
        throw new Error('Thank you not found');
      }

      return thank;
    }

    /*
     * Create new thank
     */
    public static async createThank(models, doc: TExmThank, user: any) {
      const thank = await models.ExmThanks.create({
        createdBy: user._id,
        createdAt: new Date(),
        ...doc,
      });

      return thank;
    }

    /*
     * Update thank
     */
    public static async updateThank(
      models,
      _id: string,
      doc: TExmThank,
      user: any
    ) {
      await models.ExmThanks.updateOne(
        { _id },
        {
          $set: {
            updatedBy: user._id,
            updatedAt: new Date(),
            ...doc,
          },
        }
      );

      return models.ExmThanks.findOne({
        _id,
      });
    }

    /*
     * Remove thank
     */
    public static async removeThank(models, _id: string) {
      const thankObj = await models.ExmThanks.findOne({ _id });
      await sendInternalNotesMessage({
        subdomain: models.subdomain,
        action: 'removeInternalNotes',
        data: {
          contentType: 'thank',
          contentTypeId: _id,
        },
        defaultValue: {},
      });
      await sendCoreMessage({
        subdomain: models.subdomain,
        action: 'conformities.removeConformity',
        data: {
          mainType: 'thank',
          mainTypeId: _id,
        },
        defaultValue: [],
      });

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
  getThank(models, _id: string);
  createThank(models, doc: TExmThank, user: any);
  updateThank(models, _id: string, doc: TExmThank, user: any);
  removeThank(models, _id: string);
}
