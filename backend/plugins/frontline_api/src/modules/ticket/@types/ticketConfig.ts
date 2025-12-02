import { Document } from 'mongoose';

export interface ITicketBasicFields {
  isShowName?: boolean;
  isShowDescription?: boolean;
  isShowAttachment?: boolean;
  isShowTags?: boolean;
}

export interface ITicketCompanyFields {
  isShowName?: boolean;
  isShowRegistrationNumber?: boolean;
  isShowAddress?: boolean;
  isShowPhoneNumber?: boolean;
  isShowEmail?: boolean;
}

export interface ITicketCustomerFields {
  isShowFirstName?: boolean;
  isShowLastName?: boolean;
  isShowPhoneNumber?: boolean;
  isShowEmail?: boolean;
}

export interface ITicketFormFieldConfig {
  key: string;
  label: string;
  order: number;
  placeholder: string;
}

export interface ITicketConfig {
  name: string;

  pipelineId: string;
  channelId: string;
  selectedStatusId: string;
  contactType: 'customer' | 'company';

  ticketBasicFields?: ITicketBasicFields;
  company?: ITicketCompanyFields;
  customer?: ITicketCustomerFields;

  fieldsConfig?: ITicketFormFieldConfig[];
}
export interface ITicketSaveConfigArgs {
  input: ITicketConfig;
}

export interface ITicketConfigUpdate extends ITicketConfig {
  _id: string;
}

export interface ITicketConfigDocument extends ITicketConfig, Document {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
}
