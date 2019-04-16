interface IAttachmentParams {
  data: string;
  filename: string;
  size: number;
  mimeType: string;
}

export interface IMailParams {
  integrationId: string;
  cocType: string;
  cocId: string;
  subject: string;
  body: string;
  toEmails: string;
  cc?: string;
  bcc?: string;
  attachments?: IAttachmentParams[];
  references?: string;
  headerId?: string;
  threadId?: string;
  fromEmail?: string;
}
