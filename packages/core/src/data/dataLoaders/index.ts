import * as DataLoader from "dataloader";
import { IModels } from "../../connectionResolver";
import * as _ from "underscore";
import user from "./user";
import company from "./company";
import productCategory from "./productCategory";
import uom from "./uom";
import tag from "./tag";

export interface IDataLoaders {
  user: DataLoader<string, any>;
  productCategory: DataLoader<string, any>;
  tag: DataLoader<string, any>;
  company: DataLoader<string, any>;
  uom: DataLoader<string, any>;
}

export function generateAllDataLoaders(models: IModels): IDataLoaders {
  return {
    user: user(models),
    productCategory: productCategory(models),
    tag: tag(models),
    company: company(models),
    uom: uom(models)
  };
}
