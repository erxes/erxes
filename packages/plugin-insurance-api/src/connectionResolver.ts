import { IContext as IMainContext } from '@erxes/api-utils/src';
import * as mongoose from 'mongoose';

import { IInsuranceProductModel, loadProductClass } from './models/Products';
import { IRiskModel, loadRiskClass } from './models/Risks';
import { IInsuranceProductDocument } from './models/definitions/products';
import { IRiskDocument } from './models/definitions/risks';
import { IInsuranceItemModel, loadItemClass } from './models/Items';
import { IInsuranceItemDocument } from './models/definitions/item';
import { IInsurancePackageModel, loadPackageClass } from './models/Packages';
import { IInsurancePackageDocument } from './models/definitions/package';
import {
  IInsuranceCategoryModel,
  loadCategoryClass,
} from './models/Categories';
import { IInsuranceCategoryDocument } from './models/definitions/category';
import { IDestinationDocument } from './models/definitions/destination';
import { IDestinationModel, loadDestinationClass } from './models/Destination';
import { createGenerateModels } from '@erxes/api-utils/src/core';

export interface IModels {
  Risks: IRiskModel;
  Products: IInsuranceProductModel;
  Items: IInsuranceItemModel;
  Packages: IInsurancePackageModel;
  Categories: IInsuranceCategoryModel;
  Destinations: IDestinationModel;
}

export interface IContext extends IMainContext {
  subdomain: string;
  models: IModels;
  cpUser: any;
}

export const loadClasses = (db: mongoose.Connection): IModels => {
  const models = {} as IModels;

  models.Risks = db.model<IRiskDocument, IRiskModel>(
    'insurance_risks',
    loadRiskClass(models),
  );

  models.Products = db.model<IInsuranceProductDocument, IInsuranceProductModel>(
    'insurance_products',
    loadProductClass(models),
  );

  models.Items = db.model<IInsuranceItemDocument, IInsuranceItemModel>(
    'insurance_items',
    loadItemClass(models),
  );

  models.Packages = db.model<IInsurancePackageDocument, IInsurancePackageModel>(
    'insurance_packages',
    loadPackageClass(models),
  );

  models.Categories = db.model<
    IInsuranceCategoryDocument,
    IInsuranceCategoryModel
  >('insurance_categories', loadCategoryClass(models));

  models.Destinations = db.model<IDestinationDocument, IDestinationModel>(
    'insurance_destinations',
    loadDestinationClass(models),
  );

  return models;
};

export const generateModels = createGenerateModels(loadClasses);
