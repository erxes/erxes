interface IShortMessage {
  content: string;
  from?: string;
  fromIntegrationId: string;
}

interface IIntegration {
  _id: string;
  kind: string;
  erxesApiId: string;
  telnyxProfileId?: string;
  telnyxPhoneNumber: string;
}

export interface IMessageParams {
  shortMessage: IShortMessage;
  to: string;
  integrations: IIntegration[];
}

export interface ITelnyxMessageParams {
  from: string;
  to: string;
  text: string;
  messaging_profile_id?: string;
  webhook_url?: string;
  webhook_failover_url?: string;
}

export interface ICallbackParams {
  engageMessageId?: string;
  msg: ITelnyxMessageParams;
}

interface ISenderParams {
  engageMessageId: string;
  customers: ICustomer[];
  createdBy: string;
  title: string;
  kind: string;
}

export interface IEmailParams extends ISenderParams {
  fromEmail: string;
  email: any;
}

export interface ISmsParams extends ISenderParams {
  shortMessage: IShortMessage;
}

export interface ICustomer {
  _id: string;
  primaryEmail: string;
  emailValidationStatus: string;
  primaryPhone: string;
  phoneValidationStatus: string;
  replacers: Array<{ key: string; value: string }>;
}

export interface ICampaign {
  _id: string;
  totalCustomersCount?: number;
  validCustomersCount?: number;
  runCount?: number;
}
