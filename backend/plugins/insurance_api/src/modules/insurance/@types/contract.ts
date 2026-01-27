import { Document } from 'mongoose';

export interface ICoveredRisk {
  risk: string;
  coveragePercentage: number;
}

export interface IInsuranceContract {
  contractNumber: string;
  vendor: string;
  customer: string;
  insuranceType: string;
  insuranceProduct: string;
  coveredRisks: ICoveredRisk[];
  chargedAmount: number;
  startDate: Date;
  endDate: Date;
  insuredObject: any;
  paymentKind: 'qpay' | 'cash';
  paymentStatus: 'pending' | 'paid';
}

export interface IContractDocument extends IInsuranceContract, Document {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
}
