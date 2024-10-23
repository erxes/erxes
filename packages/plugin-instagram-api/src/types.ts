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
