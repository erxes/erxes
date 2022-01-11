import { Document } from 'mongoose';

import { ICustomField } from './common';

export interface IItemCommonFields {
  name?: string;
  // TODO migrate after remove 2row
  companyIds?: string[];
  customerIds?: string[];
  startDate?: Date;
  closeDate?: Date;
  stageChangedDate?: Date;
  description?: string;
  assignedUserIds?: string[];
  watchedUserIds?: string[];
  notifiedUserIds?: string[];
  labelIds?: string[];
  attachments?: any[];
  stageId: string;
  initialStageId?: string;
  modifiedAt?: Date;
  modifiedBy?: string;
  userId?: string;
  createdAt?: Date;
  order?: number;
  searchText?: string;
  priority?: string;
  sourceConversationIds?: string[];
  status?: string;
  timeTrack?: {
    status: string;
    timeSpent: number;
    startDate?: string;
  };
  customFieldsData?: ICustomField[];
  score?: number;
  number?: string;
}

export interface IItemCommonFieldsDocument extends IItemCommonFields, Document {
  _id: string;
}

interface ICommonFields {
  userId?: string;
  createdAt?: Date;
  order?: number;
  type: string;
}

export interface IStage extends ICommonFields {
  name?: string;
  probability?: string;
  pipelineId: string;
  formId?: string;
  status?: string;
}

export interface IStageDocument extends IStage, Document {
  _id: string;
}

export interface IPipeline extends ICommonFields {
  name?: string;
  boardId: string;
  status?: string;
  visibility?: string;
  memberIds?: string[];
  bgColor?: string;
  watchedUserIds?: string[];
  startDate?: Date;
  endDate?: Date;
  metric?: string;
  hackScoringType?: string;
  templateId?: string;
  isCheckUser?: boolean;
  excludeCheckUserIds?: string[];
  numberConfig?: string;
  numberSize?: string;
  lastNum?: string;
}

export interface IPipelineDocument extends IPipeline, Document {
  _id: string;
}
