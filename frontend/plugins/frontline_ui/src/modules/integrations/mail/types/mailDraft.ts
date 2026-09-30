export type MailDraftStatus = 'pending' | 'sending' | 'sent';

export interface MailDraft {
  _id: string;
  sourceMessageId?: string;
  to?: string[];
  subject?: string;
  body?: string;
  senderMismatch?: boolean;
  status: MailDraftStatus;
  createdAt?: string;
}

export interface MailDraftEdit {
  subject?: string;
  body: string;
}
