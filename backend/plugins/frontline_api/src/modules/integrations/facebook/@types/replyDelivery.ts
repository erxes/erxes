import type { IAttachment } from '@/integrations/facebook/@types/utils';

export interface FacebookReplyPart {
  content: string;
  attachments: IAttachment[];
}

export interface FacebookReplyDelivery {
  status: 'sent' | 'partial';
  textSent: boolean;
  sentAttachmentUrls: string[];
  error?: string;
}

export interface FacebookReplyPartHandlers {
  send: (part: FacebookReplyPart) => Promise<string>;
  persist: (part: FacebookReplyPart, messageId: string) => Promise<void>;
}
