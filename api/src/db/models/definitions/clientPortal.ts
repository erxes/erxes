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
  domain?: string;
  dnsStatus?: string;
  styles?: IStyles;
  advanced?: IAdvencedSettings;
  css?: string;
  mobileResponsive?: boolean;
}

interface IStyles {
  bodyColor?: string;
  headerColor?: string;
  footerColor?: string;
  helpColor?: string;
  backgroundColor?: string;
  activeTabColor?: string;
  baseColor?: string;
  headingColor?: string;
  linkColor?: string;
  linkHoverColor?: string;
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

const stylesSchema = new Schema({
  bodyColor: field({ type: String, optional: true }),
  headerColor: field({ type: String, optional: true }),
  footerColor: field({ type: String, optional: true }),
  helpColor: field({ type: String, optional: true }),
  backgroundColor: field({ type: String, optional: true }),
  activeTabColor: field({ type: String, optional: true }),
  baseColor: field({ type: String, optional: true }),
  headingColor: field({ type: String, optional: true }),
  linkColor: field({ type: String, optional: true }),
  linkHoverColor: field({ type: String, optional: true })
});

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
  description: field({ type: String, optional: true }),
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
  domain: field({ type: String, optional: true }),
  dnsStatus: field({ type: String, optional: true }),
  styles: field({ type: stylesSchema, optional: true }),
  advanced: field({ type: advancedSettingsSchema, optional: true }),
  css: field({ type: String, optional: true }),
  mobileResponsive: field({ type: Boolean, optional: true })
});
