import { IWhatsappAttachment } from '@/integrations/whatsapp/@types/conversationMessages';

export interface IWhatsappMessageValue {
  metadata?: {
    phone_number_id?: string;
    display_phone_number?: string;
  };
  contacts?: Array<{
    wa_id?: string;
    profile?: {
      name?: string;
    };
  }>;
  messages?: IWhatsappIncomingMessage[];
}

export interface IWhatsappIncomingMessage {
  id: string;
  from: string;
  timestamp?: string;
  type?: string;
  text?: {
    body?: string;
  };
  image?: unknown;
  video?: unknown;
  audio?: unknown;
  document?: unknown;
  interactive?: unknown;
  button?: unknown;
  location?: unknown;
  contacts?: unknown;
  reaction?: unknown;
  button_reply?: {
    id?: string;
    title?: string;
  };
  list_reply?: {
    id?: string;
    title?: string;
  };
  context?: {
    id?: string;
    from?: string;
  };
}

export interface IWhatsappMessagePayload {
  integrationId?: string;
  conversationId: string;
  content?: string;
  attachments?: IWhatsappAttachment[];
  userId?: string;
  internal?: boolean;
}
