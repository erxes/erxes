import { Model } from 'mongoose';
import * as _ from 'underscore';
import { Document, Schema } from 'mongoose';
import { IModels } from '../connectionResolver';
import { field } from './utils';

export interface ISite {
  name: string;
  domain?: string;
  templateId?: string;

  createdBy?: string;
  modifiedBy?: string;
}

export interface ISiteDocument extends ISite, Document {
  _id: string;

  createdAt: Date;
  modifiedAt: Date;
}

export const siteSchema = new Schema({
  name: field({ type: String, label: 'Name', unique: true }),
  domain: field({ type: String, optional: true, label: 'Domain' }),
  templateId: field({ type: String, optional: true, label: 'Template id' }),

  createdBy: field({ type: String, optional: true, label: 'Created by' }),
  modifiedBy: field({ type: String, optional: true, label: 'Modified by' }),

  createdAt: field({ type: Date, label: 'Created at', esType: 'date' }),
  modifiedAt: field({ type: Date, label: 'Modified at', esType: 'date' })
});

export interface ISiteModel extends Model<ISiteDocument> {
  checkDuplication(doc: ISite, _id?: string): void;
  createSite(
    doc: ISite,
    userId: string,
    fromTemplate?: boolean
  ): Promise<ISiteDocument>;
  updateSite(_id: string, doc: ISite, userId: string): Promise<ISiteDocument>;
  removeSite(_id: string): Promise<ISiteDocument>;
}

export const loadSiteClass = (models: IModels) => {
  class Site {
    public static async checkDuplication({ name }: ISite, _id?: string) {
      const query: any = {};

      let previousEntry;

      if (_id) {
        query._id = { $ne: _id };
      }

      if (name) {
        previousEntry = await models.Sites.findOne({ ...query, name });

        if (previousEntry) {
          throw new Error('Name duplicated!');
        }
      }
    }

    public static async createSite(
      doc,
      userId: string,
      fromTemplate?: boolean
    ) {
      // creating a site using a template
      if (fromTemplate) {
        doc.name = doc.name + '1';

        try {
          await models.Sites.create({
            ...doc,
            createdAt: new Date(),
            createdBy: userId
          });
        } catch ({ message }) {
          if (message.includes(`E11000 duplicate key error`)) {
            await this.createSite(doc, userId, true);
          }
        }

        return doc.name;
      }

      await this.checkDuplication(doc);

      return models.Sites.create({
        ...doc,

        createdAt: new Date(),
        createdBy: userId
      });
    }

    public static async updateSite(_id: string, doc: ISite, userId: string) {
      await this.checkDuplication(doc, _id);

      await models.Sites.updateOne(
        { _id },
        { $set: { ...doc, modifiedAt: new Date(), modifiedBy: userId } }
      );

      return models.Sites.findOne({ _id });
    }

    public static async removeSite(_id) {
      // remove site pages
      await models.Pages.deleteMany({
        siteId: _id
      });

      const contentTypes = await models.ContentTypes.find({ siteId: _id });

      // remove site contentTypes
      for (const type of contentTypes) {
        await models.ContentTypes.removeContentType(type._id);
      }

      return models.Sites.deleteOne({
        _id
      });
    }
  }

  siteSchema.loadClass(Site);

  return siteSchema;
};
