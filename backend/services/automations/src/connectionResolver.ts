import { Connection, Model } from 'mongoose';

import {
  IAutomationWaitingActionDocument,
  waitingActionsToExecuteSchema,
} from './mongo/waitingActionsToExecute';
import {
  automationMemorySchema,
  IAutomationMemoryDocument,
} from './mongo/automationMemory';
import {
  AiAgentDocument,
  aiAgentSchema,
  automationExecutionSchema,
  automationSchema,
  IAutomationDocument,
  IAutomationExecutionDocument,
} from 'erxes-api-shared/core-modules';
import { IMainContext } from 'erxes-api-shared/core-types';
import { createGenerateModels } from 'erxes-api-shared/utils';

export interface IModels {
  Automations: Model<IAutomationDocument>;
  Executions: Model<IAutomationExecutionDocument>;
  WaitingActions: Model<IAutomationWaitingActionDocument>;
  AiAgents: Model<AiAgentDocument>;
  AutomationMemory: Model<IAutomationMemoryDocument>;
}

export interface IContext extends IMainContext {
  subdomain: string;
  models: IModels;
}

export const loadClasses = (db: Connection, subdomain: string): IModels => {
  const models = {} as IModels;

  models.Automations = db.model<
    IAutomationDocument,
    Model<IAutomationDocument>
  >('automations', automationSchema);

  models.Executions = db.model<
    IAutomationExecutionDocument,
    Model<IAutomationExecutionDocument>
  >('automations_executions', automationExecutionSchema);

  models.WaitingActions = db.model<
    IAutomationWaitingActionDocument,
    Model<IAutomationWaitingActionDocument>
  >('automations_waiting_actions_execute', waitingActionsToExecuteSchema);

  models.AiAgents = db.model<AiAgentDocument, Model<AiAgentDocument>>(
    'automations_ai_agents',
    aiAgentSchema,
  );

  models.AutomationMemory = db.model<
    IAutomationMemoryDocument,
    Model<IAutomationMemoryDocument>
  >('automations_memory', automationMemorySchema);

  return models;
};

export const generateModels = createGenerateModels<IModels>(loadClasses);
