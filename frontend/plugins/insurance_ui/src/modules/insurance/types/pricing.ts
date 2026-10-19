export interface DurationTier {
  minDays: number;
  maxDays: number;
  fee: number;
}

export interface TravelFormula {
  regionId: string;
  regionName: string;
  slope21: number;
  intercept21: number;
  slope21plus: number;
  intercept21plus: number;
}

// Existing JSON fields remain extensible; typing them must not strip other keys.
export interface PricingConfig extends Record<string, unknown> {
  percentage?: number | string;
  percentageByDuration?: Record<string, number | string>;
  baseRate?: number;
  dailyRate?: number;
  durationTiers?: DurationTier[];
  formulas?: TravelFormula[];
  coverageAmount?: number;
  coverageCurrency?: string;
  region?: string;
  regionName?: string;
  regionIcon?: string;
  regionDescription?: string;
  countries?: string[];
}
