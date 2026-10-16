export interface IConversationConvertAttachment {
  url: string;
  name: string;
  size: number;
  type: string;
}

export type ConversationConvertType = 'ticket' | 'deal';

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
  priority?: string;
  tagIds?: string[];
  startDate?: Date;
  closeDate?: Date;
}
