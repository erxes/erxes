import { adsSchema, IadsDocument } from "./definitions/ads";
import { Model } from "mongoose";

export interface IAdsModel extends Model<IadsDocument> {}

export const loadAdsClass = (models) => {
  class Ads {}

  adsSchema.loadClass(Ads);

  return adsSchema;
};
