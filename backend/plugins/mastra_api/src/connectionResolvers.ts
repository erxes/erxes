import { createGenerateModels } from 'erxes-api-shared/utils';
import { IMainContext } from 'erxes-api-shared/core-types';
import mongoose from 'mongoose';

import { loadAgentClass, IMastraAgentModel } from '@/agent/db/models/Agent';
import { loadToolClass, IMastraToolModel } from '@/tool/db/models/Tool';
import { loadProviderClass, IMastraProviderModel } from '@/provider/db/models/Provider';
import { loadSettingsClass, IMastraSettingsModel } from '@/settings/db/models/Settings';

export interface IModels {
  MastraAgent: IMastraAgentModel;
  MastraTool: IMastraToolModel;
  MastraProvider: IMastraProviderModel;
  MastraSettings: IMastraSettingsModel;
}

export interface IContext extends IMainContext {
  models: IModels;
  user: any;
}

export const loadClasses = (db: mongoose.Connection): IModels => {
  const models = {} as IModels;

  models.MastraAgent = db.model<any, IMastraAgentModel>(
    'mastra_agents',
    loadAgentClass(models),
  );

  models.MastraTool = db.model<any, IMastraToolModel>(
    'mastra_tools',
    loadToolClass(models),
  );

  models.MastraProvider = db.model<any, IMastraProviderModel>(
    'mastra_providers',
    loadProviderClass(models),
  );

  models.MastraSettings = db.model<any, IMastraSettingsModel>(
    'mastra_settings',
    loadSettingsClass(models),
  );

  return models;
};

export const generateModels = createGenerateModels<IModels>(loadClasses);
