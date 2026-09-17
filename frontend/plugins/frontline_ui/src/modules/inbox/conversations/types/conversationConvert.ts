export interface IConversationConvertAttachment {
  url: string;
  name: string;
  size: number;
  type: string;
}

export type ConversationConvertType = 'ticket' | 'deal' | 'task';

export interface IConversationConvertedItem {
  _id: string;
  type: ConversationConvertType;
  url: string;
}

export interface IConversationConvertVariables {
  _id: string;
  type: ConversationConvertType;
  itemName: string;
  stageId: string;
  assignedUserIds?: string[];
  branchIds?: string[];
  departmentIds?: string[];
  description?: string;
  customFieldsData?: Record<string, unknown>;
  attachments?: IConversationConvertAttachment[];
}

export interface IConvertTaskTeam {
  _id: string;
  name: string;
  icon?: string;
}

export interface IConvertTaskStatus {
  label: string;
  value: string;
  color?: string;
  type?: number;
}
