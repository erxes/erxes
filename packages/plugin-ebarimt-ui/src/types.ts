// SETTINGS

export type IConfigsMap = { [key: string]: any };

export type IConfig = {
  _id: string;
  code: string;
  value: any;
};

// query types
export type ConfigsQueryResponse = {
  configs: IConfig[];
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
  segment?: string;
  tag?: string;
  brand?: string;
  ids?: string[];
  searchValue?: string;
  sortField?: string;
  sortDirection?: number;
};
