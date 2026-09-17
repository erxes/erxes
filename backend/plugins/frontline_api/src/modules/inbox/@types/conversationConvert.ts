import { IAttachment, IPropertyField } from 'erxes-api-shared/core-types';

export type ConversationConvertType = 'ticket' | 'deal' | 'task';

export interface IConversationConvert {
  _id: string;
  type: string;
  itemName?: string;
  stageId?: string;
  customFieldsData?: IPropertyField;
  priority?: string;
  assignedUserIds?: string[];
  labelIds?: string[];
  tagIds?: string[];
  branchIds?: string[];
  departmentIds?: string[];
  startDate?: Date;
  closeDate?: Date;
  attachments?: IAttachment[];
  description?: string;
}

export interface IConversationConvertedItem {
  type: ConversationConvertType;
  _id: string;
  url: string;
}
