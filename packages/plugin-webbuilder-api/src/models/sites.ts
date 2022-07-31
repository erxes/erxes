import { Model } from 'mongoose';
import * as _ from 'underscore';
import { Document, Schema } from 'mongoose';
import { IModels } from '../connectionResolver';

export interface ISite {
  name: string;
  domain: string;
}

export interface ISiteDocument extends ISite, Document {
  _id: string;
}

export const siteschema = new Schema({
  name: { type: String, label: 'Name' },
  domain: { type: String }
});

export interface ISiteModel extends Model<ISiteDocument> {
  createSite(doc: ISite): Promise<ISiteDocument>;
  updateSite(_id: string, doc: ISite): Promise<ISiteDocument>;
  removeSite(_id: string): Promise<ISiteDocument>;
}

export const loadSiteClass = (models: IModels) => {
  class Site {
    public static async createSite(doc) {
      return models.Sites.create(doc);
    }

    public static async updateSite(_id: string, doc) {
      await models.Sites.updateOne({ _id }, { $set: doc });

      return models.Sites.findOne({ _id });
    }

    public static async remoteSite(_id) {
      return models.Sites.deleteOne({ _id });
    }
  }

  siteschema.loadClass(Site);

  return siteschema;
};
