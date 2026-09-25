export type TMailTriggerTarget = {
  _id: string;
  messageId: string;
  subject: string;
  content: string;
  from: string;
  to: string[];
  conversationId: string;
  customerId: string;
  integrationId: string;
  hasAttachments: boolean;
  senderMismatch: boolean;
  createdAt?: Date | string;
};

export type TMailTriggerConfig = {
  integrationIds?: string[];
  fromAddresses?: string;
  subjectKeywords?: string;
  keywords?: string;
  includeUnverifiedSenders?: boolean;
};
