// queries
export interface IBurenScoring {
  _id?: string;
  externalScoringResponse: any;
  score?: number;
  customerId?: string;
  reportPurpose?: string;
  keyword?: string;
  restInquiryResponse?: any;
  createdAt?: Date;
  createdBy?: string;
}

export type BurenScoringQueryResponse = {
  burenCustomerScoringsMain: { list: IBurenScoring[]; totalCount: number };
  refetch: () => void;
  loading: boolean;
};

export type DetailQueryResponse = {
  getCustomerScore: IBurenScoring;
  loading: boolean;
};

export type ScoringResultResponse = {
  getCustomerScoring: any;
  loading: boolean;
};

export type ToFintechScoringResponse = {
  toFintechScoring: (params: {
    variables: { reportPurpose: string; keyword: string };
  }) => Promise<any>;
};
export type IConfigsMaps = { [key: string]: any };

export type IBurenConfig = {
  _id: string;
  code: string;
  value: any;
};

export type ConfigsResponse = {
  configs: IBurenConfig[];
  loading: boolean;
  refetch: () => void;
};

export type CustomerFieldsResponse = {
  fields: any;
  loading: boolean;
  refetch: () => void;
};

export type RegiserResponse = {
  getRegister: string;
  loading: boolean;
  refetch: () => void;
};

