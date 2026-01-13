import { Document } from 'mongoose'

export interface IConversationMessage {
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
    fromBot?: boolean;
    isCustomerRead?: boolean;
    internal?: boolean;
    botId?: string;
    botData?: any;
  }
  
  export interface IConversationMessageDocument
    extends IConversationMessage,
      Document {
    _id: string;
  }
  