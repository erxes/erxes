import { IContext as IMainContext } from '@erxes/api-utils/src';
import * as mongoose from 'mongoose';

import { mainDb } from './configs';
import { IInsuranceProductModel, loadProductClass } from './models/Products';
import { IRiskModel, loadRiskClass } from './models/Risks';
import { IInsuranceProductDocument } from './models/definitions/products';
import { IRiskDocument } from './models/definitions/risks';

export interface IModels {
  Risks: IRiskModel;
  Products: IInsuranceProductModel;
}

export interface IContext extends IMainContext {
  subdomain: string;
  models: IModels;
  cpUser: any;
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

  models.Risks = db.model<IRiskDocument, IRiskModel>(
    'insurance_risks',
    loadRiskClass(models)
  );

  models.Products = db.model<IInsuranceProductDocument, IInsuranceProductModel>(
    'insurance_products',
    loadProductClass(models)
  );

  return models;
};
