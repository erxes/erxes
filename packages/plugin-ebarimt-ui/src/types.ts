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
