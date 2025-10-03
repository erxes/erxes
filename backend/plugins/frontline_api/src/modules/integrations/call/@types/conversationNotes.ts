export interface IConversationId {
  conversationId: string;
}

export interface IPageParams {
  skip?: number;
  limit?: number;
}

export interface INotesParams extends IConversationId, IPageParams {
  getFirst?: boolean;
}

export interface ICallConversationNote {
  mid: string;
  conversationId: string;
  content: string;
  // from inbox
  createdAt?: Date;
  updatedAt?: Date;
  attachments?: any;
  customerId?: string;
  visitorId?: string;
  userId?: string;
  isCustomerRead?: boolean;
  internal?: boolean;
}

export interface ICallConversationNoteDocument
  extends ICallConversationNote,
    Document {
  _id: string;
}
