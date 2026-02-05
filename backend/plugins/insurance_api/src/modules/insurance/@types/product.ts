import { Document } from 'mongoose';

export interface IProductCoveredRisk {
  risk: string;
  coveragePercentage: number;
}

export interface IProduct {
  name: string;
  code?: string;
  insuranceType: string;
  coveredRisks: IProductCoveredRisk[];
  pricingConfig: any;
  pdfContent?: string;
}

export interface IProductDocument extends IProduct, Document {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
}
