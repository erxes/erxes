import * as mongoose from "mongoose";
import { mainDb } from "./configs";
import { IadsDocument } from "./models/definitions/ads";
import { IAdsModel, loadAdsClass } from "./models/ads";
import { IContext as IMainContext } from "@erxes/api-utils/src";

export interface IModels {
  Ads: IAdsModel;
}
export interface IContext extends IMainContext {
  subdomain: string;
  models: IModels;
}

export let models: IModels;

export const generateModels = async (
  _hostnameOrSubdomain: string
): Promise<IModels> => {
  if (models) {
    return models;
  }

  loadClasses(mainDb);

  return models;
};

export const loadClasses = (db: mongoose.Connection): IModels => {
  models = {} as IModels;

  models.Ads = db.model<IadsDocument, IAdsModel>("ads", loadAdsClass(models));

  return models;
};
