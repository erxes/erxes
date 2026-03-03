// Customer Types
export enum CustomerType {
  INDIVIDUAL = 'individual',
  COMPANY = 'company',
}

export interface RiskType {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AttributeDefinition {
  name: string;
  dataType: string;
  required: boolean;
  description?: string;
  options?: string[];
  min?: number;
  max?: number;
  subAttributes?: AttributeDefinition[];
}

export interface InsuranceType {
  id: string;
  name: string;
  attributes: AttributeDefinition[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CoveredRisk {
  risk: RiskType;
  coveragePercentage: number;
}

export interface AdditionalCoverage {
  name: string;
  limits: number[];
  appliesTo: string[];
}

export interface CompensationCalculation {
  name: string;
  methodologies: string[];
}

export interface DeductibleConfig {
  levels: string[];
}

export interface InsuranceProduct {
  id: string;
  name: string;
  insuranceType: InsuranceType;
  coveredRisks: CoveredRisk[];
  pricingConfig: any;
  pdfContent?: string;
  additionalCoverages?: AdditionalCoverage[];
  compensationCalculations?: CompensationCalculation[];
  deductibleConfig?: DeductibleConfig;
  createdAt: Date;
  updatedAt: Date;
}

export interface InsuranceVendorProduct {
  product: InsuranceProduct;
  pricingOverride?: any;
}

export interface InsuranceVendor {
  id: string;
  name: string;
  offeredProducts: InsuranceVendorProduct[];
  createdAt: Date;
  updatedAt: Date;
}

export interface VendorUser {
  id: string;
  name?: string;
  email: string;
  phone?: string;
  vendor: InsuranceVendor;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface InsuranceCustomer {
  id: string;
  firstName: string;
  lastName: string;
  type: CustomerType;
  registrationNumber: string;
  email?: string;
  phone?: string;
  companyName?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface InsuranceContract {
  id: string;
  contractNumber: string;
  vendor: InsuranceVendor;
  customer: InsuranceCustomer;
  insuranceType: InsuranceType;
  insuranceProduct: InsuranceProduct;
  coveredRisks: CoveredRisk[];
  chargedAmount: number;
  startDate: Date;
  endDate: Date;
  insuredObject: any;
  paymentKind: string;
  paymentStatus: string;
  createdAt: Date;
  updatedAt: Date;
}

// Input Types
export interface AttributeInput {
  name: string;
  dataType: string;
  required?: boolean;
  description?: string;
  options?: string[];
  min?: number;
  max?: number;
  subAttributes?: AttributeInput[];
}

export interface InsuranceCustomerInput {
  firstName: string;
  lastName: string;
  type: CustomerType;
  registrationNumber: string;
  email?: string;
  phone?: string;
  companyName?: string;
}

export interface CoveredRiskInput {
  riskId: string;
  coveragePercentage: number;
}

export interface InsuranceContractInput {
  vendorId: string;
  customerId: string;
  insuranceTypeId: string;
  insuranceProductId: string;
  coveredRisks: CoveredRiskInput[];
  chargedAmount: number;
  startDate: Date;
  endDate: Date;
  insuredObject: any;
}
