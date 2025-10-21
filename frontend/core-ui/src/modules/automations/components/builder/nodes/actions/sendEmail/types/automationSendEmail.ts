export enum TAutomationSendEmailSenderTypes {
  Default = 'default',
  Custom = 'custom',
}

export type TAutomationSendEmailConfig = {
  type: TAutomationSendEmailSenderTypes;
  fromUserId?: string;
  customMails?: string[];
  attributionMails?: string;
  teamMember?: string[];
  customer?: string[];
  subject: string;
};
