import { createGenerateModels } from 'erxes-api-shared/utils';
import { IMainContext } from 'erxes-api-shared/core-types';
import mongoose from 'mongoose';

import { loadAgentClass, IMastraAgentModel } from '@/agent/db/models/Agent';
import { loadProviderClass, IMastraProviderModel } from '@/provider/db/models/Provider';
import { loadSettingsClass, IMastraSettingsModel } from '@/settings/db/models/Settings';
import { loadThreadClass, IMastraThreadModel } from '@/session/db/models/Thread';
import { loadMessageClass, IMastraMessageModel } from '@/session/db/models/Message';
import {
  loadWorkingMemoryClass,
  IMastraWorkingMemoryModel,
} from '@/memory/db/models/WorkingMemory';

export interface IModels {
  MastraAgent: IMastraAgentModel;
  MastraProvider: IMastraProviderModel;
  MastraSettings: IMastraSettingsModel;
  MastraThread: IMastraThreadModel;
  MastraMessage: IMastraMessageModel;
  MastraWorkingMemory: IMastraWorkingMemoryModel;
}

export interface IContext extends IMainContext {
  models: IModels;
  user: any;
  subdomain: string;
}

export const loadClasses = (db: mongoose.Connection): IModels => {
  const models = {} as IModels;

  models.MastraAgent = db.model<any, IMastraAgentModel>(
    'mastra_agents',
    loadAgentClass(models),
  );

  models.MastraProvider = db.model<any, IMastraProviderModel>(
    'mastra_providers',
    loadProviderClass(models),
  );

  models.MastraSettings = db.model<any, IMastraSettingsModel>(
    'mastra_settings',
    loadSettingsClass(models),
  );

  models.MastraThread = db.model<any, IMastraThreadModel>(
    'mastra_threads',
    loadThreadClass(models),
  );

  models.MastraMessage = db.model<any, IMastraMessageModel>(
    'mastra_messages',
    loadMessageClass(models),
  );

  models.MastraWorkingMemory = db.model<any, IMastraWorkingMemoryModel>(
    'mastra_working_memory',
    loadWorkingMemoryClass(models),
  );

  return models;
};

export const generateModels = createGenerateModels<IModels>(loadClasses);
