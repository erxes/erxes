import type {
  InsuranceCustomersQuery,
  InsuranceProductsQuery,
  InsuranceRegionsQuery,
  InsuranceRiskTypesQuery,
  InsuranceTypesQuery,
  InsuranceVendorUsersQuery,
  InsuranceVendorsQuery,
} from '~/gql/graphql';

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

export type InsuranceVendor = InsuranceVendorsQuery['vendors'][number];

export type InsuranceVendorProduct = InsuranceVendor['offeredProducts'][number];

export type VendorUser = InsuranceVendorUsersQuery['vendorUsers'][number];

export type InsuranceCustomer =
  InsuranceCustomersQuery['insuranceCustomers'][number];

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
