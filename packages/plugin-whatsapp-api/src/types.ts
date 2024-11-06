export interface IMessageData {
  sender: { id: string };
  recipient: { id: string };
  timestamp: number;
  text?: string;
  message: {
    attachments?: Array<{
      type: string;
      payload: { url: string };
    }>;
    mid: string;
    text: string;
    is_deleted: boolean;
  };
  metadata: {
    phone_number_id: string;
  };
  contacts: Array<{
    wa_id?: string;
  }>;
  messages: Array<{
    id?: string;
    timestamp?: string;
    type?: 'text' | 'image' | 'video' | 'sticker' | 'document' | 'audio';
    text?: {
      body?: string;
    };
    image?: {
      id?: string;
      caption?: string;
      mime_type?: string;
    };
    video?: {
      id?: string;
      mime_type?: string;
    };
    sticker?: {
      id?: string;
      mime_type?: string;
    };
    document?: {
      id?: string;
      mime_type?: string;
    };
    audio?: {
      id?: string;
      mime_type?: string;
    };
  }>;
}
export interface IAttachment {
  type: string;
  url: string;
}

export interface IAttachmentMessage {
  attachment: {
    type: string;
    payload: {
      url: string;
    };
  };
}
