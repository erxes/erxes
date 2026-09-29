import type { IFacebookConversationMessage } from '@/integrations/facebook/types/FacebookTypes';

export interface IFacebookConversationMessagesQuery {
  facebookConversationMessages: IFacebookConversationMessage[];
  facebookConversationMessagesCount: number;
}

export interface IFacebookConversationMessagesQueryVariables {
  _id?: string;
  conversationId?: string;
  limit?: number;
  skip?: number;
  getFirst?: boolean;
}
