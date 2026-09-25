import { Document } from 'mongoose';

export interface IPaymentDealConfig {
  enabled?: boolean;
  boardId?: string;
  pipelineId?: string;
  stageId?: string;
}

export interface IPayment {
  name: string;
  kind: string;
  status: string;
  config: any;
  acceptedCurrencies: string[];
  sendEmailOnPayment?: boolean;
  dealConfig?: IPaymentDealConfig;
}

export interface IPaymentDocument extends IPayment, Document {
  _id: string;
}
