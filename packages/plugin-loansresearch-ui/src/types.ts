export type ILoanResearch = {
  _id?: string;
  apiUrl: string;
  isLocalUser: boolean;
  userDN: string;
  adminDN?: string;
  adminPassword?: string;
  code: string;
};

export type MainQueryResponse = {
  loansResearchMain: { list: ILoanResearch[]; totalCount: number };
  loading: boolean;
  refetch: () => void;
};
