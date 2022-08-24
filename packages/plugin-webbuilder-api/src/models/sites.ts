import { Model } from 'mongoose';
import * as _ from 'underscore';
import { Document, Schema } from 'mongoose';
import { IModels } from '../connectionResolver';
import { field } from './utils';

export interface ISite {
  name: string;
  domain?: string;
}

export interface ISiteDocument extends ISite, Document {
  _id: string;
}

export const siteSchema = new Schema({
  _id: field({ pkey: true }),
  name: field({ type: String, label: 'Name', unique: true }),
  domain: field({ type: String, optional: true, label: 'Domain' })
});

export interface ISiteModel extends Model<ISiteDocument> {
  checkDuplication(doc: ISite, _id?: string): void;
  createSite(doc: ISite, fromTemplate?: boolean): Promise<ISiteDocument>;
  updateSite(_id: string, doc: ISite): Promise<ISiteDocument>;
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

    public static async createSite(doc, fromTemplate?: boolean) {
      // creating a site using a template
      if (fromTemplate) {
        doc.name = doc.name + '1';

        try {
          await models.Sites.create(doc);
        } catch ({ message }) {
          if (message.includes(`E11000 duplicate key error`)) {
            await this.createSite(doc, true);
          }
        }

        return doc.name;
      }

      await this.checkDuplication(doc);

      return models.Sites.create(doc);
    }

    public static async updateSite(_id: string, doc) {
      await this.checkDuplication(doc, _id);

      await models.Sites.updateOne({ _id }, { $set: doc });

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
