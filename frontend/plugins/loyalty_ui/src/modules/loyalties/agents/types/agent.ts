export interface IAgent {
  _id: string;
  number: string;
  status: string;
  customerIds?: string[];
  companyIds?: string[];
  hasReturn: boolean;
  returnAmount?: number;
  returnPercent?: number;
  prepaidPercent?: number;
  discountPercent?: number;
  startDate?: string;
  endDate?: string;
  startMonth?: string;
  endMonth?: string;
  startDay?: string;
  endDay?: string;
  productRuleIds?: string[];
  rulesOfProducts?: Record<string, unknown>[];
}
