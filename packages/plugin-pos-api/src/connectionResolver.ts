import * as mongoose from "mongoose";
import { mainDb } from "./configs";
// import { ITagDocument } from "./models/definitions/pos";
import {
  loadPosClass,
  loadProductGroupClass,
  IPosModel,
  IProductGroupModel,
} from "./models/Pos";
import { IContext as IMainContext } from "@erxes/api-utils/src";

export interface IModels {
  Pos: IPosModel;
  ProductGroup: IProductGroupModel;
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

  models.Pos = db.model<, IPosModel>("pos", loadPosClass(models));
  models.ProductGroup = db.model<, IPosModel>("productGroup", loadProductGroupClass(models));

  return models;
};
