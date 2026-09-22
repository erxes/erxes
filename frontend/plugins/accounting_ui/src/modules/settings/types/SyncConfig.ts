export interface ISyncGeneralFields {
  title: string;
  dateRule: 'alwaysNow' | 'syncedDateOrNow';
  trStatus?: string;
}

export interface ISyncReturnTypeFields {
  returnType: 'fullTr' | 'onlySale' | 'delete';
}

export interface ISyncAccountsSectionFields {
  saleAccountId: string;
  saleOutAccountId: string;
  saleCostAccountId: string;
  branchId: string;
  departmentId: string;
}

export interface ISyncPaymentsFields {
  defaultPayment: { accountId: string } | null;
  defaultNegPayment: { accountId: string } | null;
  payments: Record<string, { accountId: string }>;
}

export interface ISyncVatCtaxFields {
  hasVat: boolean;
  vatRowId: string;
  reverseVatRules?: string[];
  hasCtax: boolean;
  ctaxRowId: string;
  reverseCtaxRules?: string[];
}
