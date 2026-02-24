import { Document } from 'mongoose';

export interface IProductCoveredRisk {
  risk: string;
  coveragePercentage: number;
}

export interface IAdditionalCoverage {
  name: string;
  limits: number[];
  appliesTo: string[];
}

export interface ICompensationCalculation {
  name: string;
  methodologies: string[];
}

export interface IDeductibleConfig {
  levels: string[];
}

export interface IProduct {
  name: string;
  code?: string;
  insuranceType: string;
  coveredRisks: IProductCoveredRisk[];
  pricingConfig: any;
  pdfContent?: string;
  templateId?: string;
  additionalCoverages?: IAdditionalCoverage[];
  compensationCalculations?: ICompensationCalculation[];
  deductibleConfig?: IDeductibleConfig;
}

export interface IProductDocument extends IProduct, Document {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
}
