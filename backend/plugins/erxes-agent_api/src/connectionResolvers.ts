import { createGenerateModels } from 'erxes-api-shared/utils';
import { IMainContext, IUserDocument } from 'erxes-api-shared/core-types';
import mongoose from 'mongoose';

import { IMastraAgentDocument } from '@/agent/@types/agent';
import { IMastraProviderDocument } from '@/provider/@types/provider';
import { IMastraSettingsDocument } from '@/settings/@types/settings';
import { IMastraWorkingMemoryDocument } from '@/memory/@types/workingMemory';
import {
  IMastraWorkflowDocument,
  IMastraWorkflowRunDocument,
} from '@/workflow/@types/workflow';
import { loadAgentClass, IMastraAgentModel } from '@/agent/db/models/Agent';
import {
  loadAgentActionLogClass,
  IMastraAgentActionLogModel,
} from '@/agent/db/models/AgentActionLog';
import { IMastraAgentActionLogDocument } from '@/agent/@types/agentActionLog';
import {
  loadProviderClass,
  IMastraProviderModel,
} from '@/provider/db/models/Provider';
import {
  loadSettingsClass,
  IMastraSettingsModel,
} from '@/settings/db/models/Settings';
import {
  loadWorkingMemoryClass,
  IMastraWorkingMemoryModel,
} from '@/memory/db/models/WorkingMemory';
import {
  loadWorkflowClass,
  IMastraWorkflowModel,
} from '@/workflow/db/models/Workflow';
import {
  loadWorkflowRunClass,
  IMastraWorkflowRunModel,
} from '@/workflow/db/models/WorkflowRun';
import {
  loadLearningClass,
  IMastraLearningModel,
} from '@/learning/db/models/Learning';
import {
  loadFeedbackClass,
  IMastraFeedbackModel,
} from '@/learning/db/models/Feedback';
import {
  IMastraLearningDocument,
  IMastraFeedbackDocument,
} from '@/learning/@types/learning';
import {
  loadScheduleClass,
  IMastraScheduleModel,
} from '@/schedule/db/models/Schedule';
import { IMastraScheduleDocument } from '@/schedule/@types/schedule';

export interface IModels {
  MastraAgent: IMastraAgentModel;
  MastraAgentActionLog: IMastraAgentActionLogModel;
  MastraProvider: IMastraProviderModel;
  MastraSettings: IMastraSettingsModel;
  MastraWorkingMemory: IMastraWorkingMemoryModel;
  MastraWorkflow: IMastraWorkflowModel;
  MastraWorkflowRun: IMastraWorkflowRunModel;
  MastraLearning: IMastraLearningModel;
  MastraFeedback: IMastraFeedbackModel;
  MastraSchedule: IMastraScheduleModel;
}

export interface IContext extends IMainContext {
  models: IModels;
  user: IUserDocument;
  subdomain: string;
}

/** Bind every plugin model class to the tenant's mongoose connection. */
export const loadClasses = (db: mongoose.Connection): IModels => {
  const models = {} as IModels;

  models.MastraAgent = db.model<IMastraAgentDocument, IMastraAgentModel>(
    'mastra_agents',
    loadAgentClass(models),
  );

  models.MastraAgentActionLog = db.model<
    IMastraAgentActionLogDocument,
    IMastraAgentActionLogModel
  >('mastra_agent_action_logs', loadAgentActionLogClass(models));

  models.MastraProvider = db.model<
    IMastraProviderDocument,
    IMastraProviderModel
  >('mastra_providers', loadProviderClass(models));

  models.MastraSettings = db.model<
    IMastraSettingsDocument,
    IMastraSettingsModel
  >('mastra_settings', loadSettingsClass(models));

  models.MastraWorkingMemory = db.model<
    IMastraWorkingMemoryDocument,
    IMastraWorkingMemoryModel
  >('mastra_working_memory', loadWorkingMemoryClass(models));

  models.MastraWorkflow = db.model<
    IMastraWorkflowDocument,
    IMastraWorkflowModel
  >('mastra_workflows', loadWorkflowClass(models));

  models.MastraWorkflowRun = db.model<
    IMastraWorkflowRunDocument,
    IMastraWorkflowRunModel
  >('mastra_workflow_runs', loadWorkflowRunClass(models));

  models.MastraLearning = db.model<
    IMastraLearningDocument,
    IMastraLearningModel
  >('mastra_learnings', loadLearningClass(models));

  models.MastraFeedback = db.model<
    IMastraFeedbackDocument,
    IMastraFeedbackModel
  >('mastra_feedbacks', loadFeedbackClass(models));

  models.MastraSchedule = db.model<
    IMastraScheduleDocument,
    IMastraScheduleModel
  >('mastra_schedules', loadScheduleClass(models));

  return models;
};

export const generateModels = createGenerateModels<IModels>(loadClasses);
