import { Document, Schema } from 'mongoose';
import { field } from './utils';

export interface IClientPortal {
  _id?: string;
  name?: string;
  description?: string;
  logo?: string;
  icon?: string;
  url?: string;
  knowledgeBaseLabel?: string;
  knowledgeBaseTopicId?: string;
  ticketLabel?: string;
  taskLabel?: string;
  taskStageId?: string;
  taskPipelineId?: string;
  taskBoardId?: string;
  ticketStageId?: string;
  ticketPipelineId?: string;
  ticketBoardId?: string;
  advanced: IAdvencedSettings;
}

interface IAdvencedSettings {
  autoSuggest?: boolean;
  enableCaptcha?: boolean;
  authAllow?: boolean;
  submitTicket?: boolean;
  viewTicket?: boolean;
  showSpecificTicket?: boolean;
}

export interface IClientPortalDocument extends IClientPortal, Document {
  _id: string;
}

const advancedSettingsSchema = new Schema({
  autoSuggest: field({ type: Boolean }),
  enableCaptcha: field({ type: Boolean }),
  authAllow: field({ type: Boolean }),
  submitTicket: field({ type: Boolean }),
  viewTicket: field({ type: Boolean }),
  showSpecificTicket: field({ type: Boolean })
});

export const clientPortalSchema = new Schema({
  _id: field({ pkey: true }),
  name: field({ type: String }),
  description: field({ type: String }),
  url: field({ type: String }),
  logo: field({ type: String, optional: true }),
  icon: field({ type: String, optional: true }),
  knowledgeBaseLabel: field({ type: String, optional: true }),
  knowledgeBaseTopicId: field({ type: String }),
  ticketLabel: field({ type: String, optional: true }),
  taskLabel: field({ type: String, optional: true }),
  taskStageId: field({ type: String }),
  taskPipelineId: field({ type: String }),
  taskBoardId: field({ type: String }),
  ticketStageId: field({ type: String }),
  ticketPipelineId: field({ type: String }),
  ticketBoardId: field({ type: String }),
  advanced: field({ type: advancedSettingsSchema })
});
