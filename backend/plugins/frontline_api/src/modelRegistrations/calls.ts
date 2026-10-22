import type { Connection } from 'mongoose';
import type { IModels } from '~/modelRegistrations/types';
import {
  type ICallCdrModel,
  loadCallCdrClass,
} from '@/integrations/call/db/models/Cdrs';
import {
  type ICallHistoryModel,
  loadCallHistoryClass,
} from '@/integrations/call/db/models/Histories';
import {
  type ICallCustomerModel,
  loadCallCustomerClass,
} from '@/integrations/call/db/models/Customers';
import {
  type ICallIntegrationModel,
  loadCallIntegrationClass,
} from '@/integrations/call/db/models/Integrations';
import {
  type ICallConfigModel,
  loadCallConfigClass,
} from '@/integrations/call/db/models/Configs';
import {
  type ICallOperatorModel,
  loadCallOperatorClass,
} from '@/integrations/call/db/models/Operators';
import {
  type ICallQueueStatisticsModel,
  loadCallQueueClass,
} from '@/integrations/call/db/models/QueueStatistics';
import {
  type ICallSessionModel,
  loadCallSessionClass,
} from '@/integrations/call/db/models/CallSessions';
import type { ICallSessionDocument } from '@/integrations/call/@types/callSessions';
import type { ICallCdrDocument } from '@/integrations/call/@types/cdrs';
import type { ICallOperatorDocuments } from '@/integrations/call/@types/operators';
import type { ICallConfigDocument } from '@/integrations/call/@types/config';
import type { ICallHistoryDocument } from '@/integrations/call/@types/histories';
import type { ICallCustomer } from '@/integrations/call/@types/customers';
import type { ICallIntegrationDocument } from '@/integrations/call/@types/integrations';
//Callpro imports
//Callpro imports
import type { ICallProIntegrationDocument } from '@/integrations/callpro/@types/integrations';
import type { ICallProCustomerDocument } from '@/integrations/callpro/@types/customers';
import type { ICallProConversationDocument } from '@/integrations/callpro/@types/conversations';
import type { ICallProLogDocument } from '@/integrations/callpro/@types/logs';
import {
  type ICallProIntegrationModel,
  loadCallProIntegrationClass,
} from '@/integrations/callpro/db/models/Integrations';
import {
  type ICallProCustomerModel,
  loadCallProCustomerClass,
} from '@/integrations/callpro/db/models/Customers';
import {
  type ICallProConversationModel,
  loadCallProConversationClass,
} from '@/integrations/callpro/db/models/Conversations';
import {
  type ICallProLogModel,
  loadCallProLogClass,
} from '@/integrations/callpro/db/models/Logs';
import type { ICallQueueStatisticsDocuments } from '@/integrations/call/@types/queueStatistics';
export const registerCallModels = (db: Connection, models: IModels): void => {
  models.CallIntegrations = db.model<
    ICallIntegrationDocument,
    ICallIntegrationModel
  >('calls_integrations', loadCallIntegrationClass(models));
  models.CallCustomers = db.model<ICallCustomer, ICallCustomerModel>(
    'calls_customers',
    loadCallCustomerClass(models),
  );
  models.CallHistory = db.model<ICallHistoryDocument, ICallHistoryModel>(
    'calls_history',
    loadCallHistoryClass(models),
  );
  models.CallConfigs = db.model<ICallConfigDocument, ICallConfigModel>(
    'calls_configs',
    loadCallConfigClass(models),
  );
  models.CallOperators = db.model<ICallOperatorDocuments, ICallOperatorModel>(
    'calls_operators',
    loadCallOperatorClass(models),
  );
  models.CallCdrs = db.model<ICallCdrDocument, ICallCdrModel>(
    'calls_cdr',
    loadCallCdrClass(models),
  );
  models.CallQueueStatistics = db.model<
    ICallQueueStatisticsDocuments,
    ICallQueueStatisticsModel
  >('calls_queue_statistics', loadCallQueueClass());
  models.CallSessions = db.model<ICallSessionDocument, ICallSessionModel>(
    'calls_sessions',
    loadCallSessionClass(models),
  );
};

export const registerCallProModels = (
  db: Connection,
  models: IModels,
): void => {
  models.CallProIntegrations = db.model<
    ICallProIntegrationDocument,
    ICallProIntegrationModel
  >('integrations_callpro', loadCallProIntegrationClass(models));
  models.CallProCustomers = db.model<
    ICallProCustomerDocument,
    ICallProCustomerModel
  >('customers_callpro', loadCallProCustomerClass(models));
  models.CallProConversations = db.model<
    ICallProConversationDocument,
    ICallProConversationModel
  >('conversations_callpro', loadCallProConversationClass(models));
  models.CallProLogs = db.model<ICallProLogDocument, ICallProLogModel>(
    'logs_callpro',
    loadCallProLogClass(),
  );
};
