export interface IConfig {
  organizationType?: 'entity' | 'bbsb';
  calculationFixed: number;
  periodLockType?: 'daily' | 'endOfMonth' | 'manual';
  isStoreInterest?: boolean;
  isCreateInvoice?: boolean;
  isChangeClassification?: boolean;
  classificationNormal?: number;
  classificationExpired?: number;
  classificationDoubt?: number;
  classificationNegative?: number;
  classificationBad?: number;
  loanGiveLimit?:number
}
