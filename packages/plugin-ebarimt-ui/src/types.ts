// SETTINGS

export type IConfigsMap = { [key: string]: any };

export type IConfig = {
  _id: string;
  code: string;
  value: any;
};

// query types
export type ConfigsQueryResponse = {
  configsGetValue: IConfig;
  loading: boolean;
  refetch: () => void;
};

export type IPutResponse = {
  number: string;

  // Холбогдох обьект
  contentType: string;
  contentId: string;
  posToken?: string;

  totalAmount?: number;
  totalVAT?: number;
  totalCityTax?: number;
  districtCode?: string;
  branchNo?: string;
  merchantTin?: string;
  posNo?: string;
  customerTin?: string;
  consumerNo?: string;
  type?: string;
  inactiveId?: string;
  invoiceId?: string;
  reportMonth?: string;
  data?: any;
  receipts?: any[];
  payments?: any[];

  easy?: boolean;

  // billType == 1 and lottery is null or '' then save
  getInformation?: string;
  // Ебаримт руу илгээсэн мэдээлэл
  sendInfo?: any
  state?: string;

  createdAt: Date;
  modifiedAt: Date;

  _id: string;
  id: string;
  posId: number;
  status: string;
  message: string;
  qrData: string;
  lottery: string;
  date: string;
};

export type PutResponsesQueryResponse = {
  putResponses: IPutResponse[];
  loading: boolean;
  refetch: () => void;
};

export type PutResponsesByDateQueryResponse = {
  putResponsesByDate: any[];
  loading: boolean;
  error?: Error;
  refetch: () => void;
};

export type PutResponsesCountQueryResponse = {
  putResponsesCount: number;
  loading: boolean;
  refetch: () => void;
};

export type PutResponsesAmountQueryResponse = {
  putResponsesAmount: number;
  loading: boolean;
  refetch: () => void;
};

export type ListQueryVariables = {
  page?: number;
  perPage?: number;
  ids?: string[];
  searchValue?: string;
  sortField?: string;
  sortDirection?: number;
};

export type ListDuplicatedQueryVariables = {
  page?: number;
  perPage?: number;
  billType?: string;
  startDate?: Date;
  endDate?: Date;
};

export type PutResponsesDuplicatedQueryResponse = {
  putResponsesDuplicated: any[];
  loading: boolean;
  error?: Error;
};

export type PutResponsesDuplicatedCountQueryResponse = {
  putResponsesDuplicatedCount: number;
  loading: boolean;
  refetch: () => void;
};

export type PutResponsesDuplicatedDetailQueryResponse = {
  putResponsesDuplicatedDetail: IPutResponse[];
  loading: boolean;
  error?: Error;
};

export type PutResponseReturnBillMutationResponse = {
  putResponseReturnBill: (mutation: {
    variables: { _id: string };
  }) => Promise<any>;
};

export type PutResponseReReturnMutationResponse = {
  putResponseReReturn: (mutation: {
    variables: { _id: string };
  }) => Promise<any>;
};

export interface IEbarimtProductRuleDoc {
  title: string;

  // filters
  productIds?: string[];
  productCategoryIds?: string[];
  excludeCategoryIds?: string[];
  excludeProductIds?: string[];
  tagIds?: string[];
  excludeTagIds?: string[];

  // rules
  kind: string; // vat, ctax

  // vat
  taxType?: string;
  taxCode?: string;
  taxPercent?: number;
}

export interface IEbarimtProductRule extends IEbarimtProductRuleDoc {
  _id: string;
  createdAt: Date;
  modifiedAt: Date;
}

// mutation types
export type ProductRuleAddMutationResponse = {
  productRuleAdd: (params: { variables: IEbarimtProductRule }) => Promise<any>;
};

export type ProductRuleEditMutationResponse = {
  productRuleEdit: (params: { variables: IEbarimtProductRuleDoc }) => Promise<any>;
};

export type ProductRuleRemoveMutationVariables = {
  ids: string[];
};

export type ProductRulesRemoveMutationResponse = {
  productRuleRemove: (params: { variables: ProductRuleRemoveMutationVariables }) => Promise<any>;
};


// query types

export type ProductRuleListQueryVariables = {
  page?: number;
  perPage?: number;
  sortField?: string;
  sortDirection?: number;
  productId?: string;
  kind?: string;
  taxCode?: string;
  taxType?: string;
};

export type ProductRulesQueryResponse = {
  ebarimtProductRules: IEbarimtProductRule[];
  loading: boolean;
  refetch: () => void;
};

export type ProductRulesCountQueryResponse = {
  ebarimtProductRulesCount: number;
  loading: boolean;
  refetch: () => void;
};
