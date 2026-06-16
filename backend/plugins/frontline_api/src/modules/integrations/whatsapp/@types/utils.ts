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
}

export interface IWhatsappMessagePayload {
  integrationId?: string;
  conversationId: string;
  content?: string;
  userId?: string;
  internal?: boolean;
}
