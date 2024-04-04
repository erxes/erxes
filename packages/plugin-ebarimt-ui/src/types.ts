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
  _id: string;
  createdAt: Date;
  modifiedAt: Date;
  contentType: string;
  contentId: string;
  number: string;
  success: string;
  billId: string;
  date: string;
  macAddress: string;
  internalCode: string;
  billType: string;
  lotteryWarningMsg: string;
  errorCode: string;
  message: string;
  getInformation: string;
  taxType: string;
  qrData: string;
  lottery: string;
  amount: string;
  cityTax: string;
  vat: string;
  cashAmount: string;
  nonCashAmount: string;
  returnBillId: string;
  sendInfo: any;
  stocks: any;
  customerNo: string;
  customerName: string;
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
