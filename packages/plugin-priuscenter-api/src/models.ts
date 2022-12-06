import * as _ from 'underscore';
import { model } from 'mongoose';
import { Schema } from 'mongoose';

export const adSchema = new Schema({
  createdAt: Date,
  cpUserId: String,

  type: String, // carSell, sparePartSell, carRent

  title: String,
  description: String,

  mark: String,
  model: String,
  color: String,
  manufacturedYear: Number,
  state: String, // new, used

  price: Number,

  attachments: [String],
  location: Object,

  authorName: String,
  authorPhone: String,
  authorEmail: String
});

export const loadAdClass = () => {
  class Ad {
    public static async getAd(_id: string) {
      const ad = await Ads.findOne({ _id });

      if (!ad) {
        throw new Error('Ad not found');
      }

      return ad;
    }

    public static async createAd(doc) {
      return Ads.create({
        ...doc,
        createdAt: new Date()
      });
    }

    public static async updateAd(_id: string, doc) {
      await Ads.updateOne({ _id }, { $set: { ...doc } });
    }

    public static async removeAd(_id: string) {
      return Ads.deleteOne({ _id });
    }
  }

  adSchema.loadClass(Ad);

  return adSchema;
};

loadAdClass();

// tslint:disable-next-line
export const Ads = model<any, any>('priuscenter_ads', adSchema);
