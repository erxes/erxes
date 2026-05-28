import { createGenerateModels } from 'erxes-api-shared/utils';
import { IMainContext } from 'erxes-api-shared/core-types';
import { IAgentAssistantDocument } from '@/agent-assistant/@types/agent-assistant';

import mongoose from 'mongoose';

import { loadAgentAssistantClass, IAgentAssistantModel } from '@/agent-assistant/db/models/agent-assistant';

export interface IModels {
  AgentAssistants: IAgentAssistantModel;
}

export interface IContext extends IMainContext {
  models: IModels;
}

export const loadClasses = (db: mongoose.Connection): IModels => {
  const models = {} as IModels;

  models.AgentAssistants = db.model<IAgentAssistantDocument, IAgentAssistantModel>(
    'agent_assistants',
    loadAgentAssistantClass(models),
  );

  return models;
};

export const generateModels = createGenerateModels<IModels>(loadClasses);
