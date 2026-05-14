import { Document } from 'mongoose';

export interface IStats {
  open: number;
  click: number;
  complaint: number;
  delivery: number;
  bounce: number;
  reject: number;
  send: number;
  renderingfailure: number;
  total: number;
  engageMessageId: string;
}

export interface IStatsDocument extends IStats, Document {}

export interface IDeliveryReports {
  engageMessageId: string;
  mailId: string;
  status: string;
  customerId: string;
  email?: string;
}

export interface IDeliveryReportsDocument extends IDeliveryReports, Document {
  customerName?: string;
}

export interface IReportQueryParams {
  customerId?: string;
  status?: string;
  searchValue?: string;
}
