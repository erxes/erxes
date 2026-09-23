import type { IFacebookConversationMessage } from '@/integrations/facebook/types/FacebookTypes';

export type FacebookMessageRowProps = {
  message: IFacebookConversationMessage;
  previousMessage: IFacebookConversationMessage;
  nextMessage: IFacebookConversationMessage;
};
