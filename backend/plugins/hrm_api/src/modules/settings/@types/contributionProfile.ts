import { Document } from 'mongoose';

export type ContributionComponentSide = 'employee' | 'employer';

export interface IContributionComponent {
  code: string;
  name: string;
  side: ContributionComponentSide;
  rate: number;
  accountId?: string;
  reportCode?: string;
}

export interface IContributionProfile {
  code: string;
  name: string;
  description?: string;
  employeeRate: number;
  employerRate: number;
  employeeCap?: number;
  employerCap?: number;
  minBase?: number;
  maxBase?: number;
  components?: IContributionComponent[];
  status: string;
  effectiveDate?: Date;
  expiryDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IContributionProfileDocument
  extends IContributionProfile,
    Document {
  _id: string;
}
