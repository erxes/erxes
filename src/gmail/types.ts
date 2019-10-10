export interface IAccountCredentials {
  token: string;
  tokenSecret: string;
  expireDate: string;
  scope: string;
}

export interface ICredentials {
  access_token: string;
  refresh_token?: string;
  expiry_date: string;
  scope: string;
}

export interface IAttachmentParams {
  filename: string;
  size: number;
  mimeType: string;
  data?: string;
  attachmentId?: string;
}

interface IGmail {
  name: string;
  email: string;
}

export interface IMailParams {
  conversationId: string;
  erxesApiMessageId: string;
  messageId: string;
  threadId: string;
  subject: string;
  body: string;
  to: [IGmail];
  cc: [IGmail];
  bcc: [IGmail];
  from: [IGmail];
  references?: string;
  headerId?: string;
  labelIds?: string[];
  reply?: string[];
  attachments?: IAttachmentParams[];
}

export interface IMessage {
  id: string;
  threadId: string;
  labelIds: string[];
  snippet: string;
  historyId: number;
  internalDate: number;
  payload: {
    partId: string;
    mimeType: string;
    filename: string;
    headers: [
      {
        name: string;
        value: string;
      }
    ];
    body: IGmailAttachment;
    parts: any;
  };
  sizeEstimate: number;
  raw: any;
}

export interface IGmailAttachment {
  attachmentId: string;
  data: any;
  size: number;
}

export interface IMessageAdded {
  message: IMessage;
}
export interface IHistroy {
  id: string;
  messages?: IMessage[];
  messagesAdded?: IMessageAdded;
}

export interface IPubsubMessage {
  data: Buffer;
  ack: () => void;
}
