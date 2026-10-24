import type {
  InsuranceProductsQuery,
  InsuranceRegionsQuery,
  InsuranceRiskTypesQuery,
  InsuranceTypesQuery,
} from '~/gql/graphql';
import type { PricingConfig } from './pricing';

// Customer Types
export enum CustomerType {
  INDIVIDUAL = 'individual',
  COMPANY = 'company',
}

export type RiskType = InsuranceRiskTypesQuery['riskTypes'][number];

export type InsuranceType = InsuranceTypesQuery['insuranceTypes'][number];

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

export type InsuranceRegion = InsuranceRegionsQuery['insuranceRegions'][number];

export interface DiscountTier {
  minTravelers: number;
  discountPercent: number;
}

export interface Traveler {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  registerNumber: string;
  passportNumber: string;
}

export type InsuranceProduct =
  InsuranceProductsQuery['insuranceProducts'][number];

export interface InsuranceVendorProduct {
  product: InsuranceProduct;
  pricingOverride?: PricingConfig | null;
  discountTiers?: DiscountTier[];
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
