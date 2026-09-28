export interface FacebookReplyDelivery {
  status: 'sent' | 'partial';
  textSent: boolean;
  sentAttachmentUrls: string[];
  error?: string;
}

export interface ConversationMessageAddResult {
  conversationMessageAdd: {
    _id: string;
    extraData?: { facebookDelivery?: FacebookReplyDelivery };
  };
}
