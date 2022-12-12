import { IBuildingModel, loadBuildingClass } from './models/Buildings';
import { IContext as IMainContext } from '@erxes/api-utils/src';
import { createGenerateModels } from '@erxes/api-utils/src/core';
import * as mongoose from 'mongoose';

import { ICityModel, loadCityClass } from './models/Cities';
import { ICityDocument } from './models/definitions/cities';
import { IDistrictDocument } from './models/definitions/districts';
import { IQuarterDocument } from './models/definitions/quarters';
import { IDistrictModel, loadDistrictClass } from './models/Districts';
import { IQuarterModel, loadQuarterClass } from './models/Quarter';
import { IBuildingDocument } from './models/definitions/buildings';

export interface IModels {
  Cities: ICityModel;
  Districts: IDistrictModel;
  Quarters: IQuarterModel;
  Buildings: IBuildingModel;
}

export interface IContext extends IMainContext {
  subdomain: string;
  models: IModels;
}

export let models: IModels | null = null;

export const loadClasses = (db: mongoose.Connection): IModels => {
  models = {} as IModels;

  models.Cities = db.model<ICityDocument, ICityModel>(
    'mobinet_cities',
    loadCityClass(models)
  );

  models.Districts = db.model<IDistrictDocument, IDistrictModel>(
    'mobinet_districts',
    loadDistrictClass(models)
  );

  models.Quarters = db.model<IQuarterDocument, IQuarterModel>(
    'mobinet_quarters',
    loadQuarterClass(models)
  );

  models.Buildings = db.model<IBuildingDocument, IBuildingModel>(
    'mobinet_buildings',
    loadBuildingClass(models)
  );

  return models;
};

export const generateModels = createGenerateModels<IModels>(
  models,
  loadClasses
);
