import {
  IBuildingModel,
  IBuildingToContactModel,
  loadBuildingClass,
  loadBuildingToContactClass
} from './models/Buildings';
import { IContext as IMainContext } from '@erxes/api-utils/src';
import { createGenerateModels } from '@erxes/api-utils/src/core';
import * as mongoose from 'mongoose';

import { ICityModel, loadCityClass } from './models/Cities';
import { ICityDocument } from './models/definitions/cities';
import { IDistrictDocument } from './models/definitions/districts';
import { IQuarterDocument } from './models/definitions/quarters';
import { IQuarterModel, loadQuarterClass } from './models/Quarter';
import { IContractDocument } from './models/definitions/contracts';
import { IContractModel, loadContractClass } from './models/Contracts';
import { IDistrictModel, loadDistrictClass } from './models/Districts';
import { IBuildingDocument } from './models/definitions/buildings';
import { IBuildingToContactDocument } from './models/definitions/buildingToContact';

export interface IModels {
  Cities: ICityModel;
  Districts: IDistrictModel;
  Quarters: IQuarterModel;
  Contracts: IContractModel;
  Buildings: IBuildingModel;
  BuildingToContacts: IBuildingToContactModel;
}

export interface IContext extends IMainContext {
  subdomain: string;
  models: IModels;
  cpUser: any;
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

  models.BuildingToContacts = db.model<
    IBuildingToContactDocument,
    IBuildingToContactModel
  >('mobinet_building_to_contact', loadBuildingToContactClass(models));

  models.Contracts = db.model<IContractDocument, IContractModel>(
    'mobinet_contracts',
    loadContractClass(models)
  );

  return models;
};

export const generateModels = createGenerateModels<IModels>(
  models,
  loadClasses
);
