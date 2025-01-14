import { IAttachment } from '@erxes/ui/src/types';

export type IIncome = {
  _id?: string;
  incomeType: String;
  files: IAttachment;
};
export type ILoan = {
  _id?: string;
  startDate: Date;
  closeDate: Date;
  files: IAttachment;
};

export type ILoanResearch = {
  _id: string;
  dealId: string;
  customerType: string;
  customerId: string;
  incomes: IIncome;
  loans: ILoan;
  debtIncomeRatio: number;
  createdAt: Date;
  modifiedAt: Date;
};

export type DetailQueryResponse = {
  loansResearchDetail: ILoanResearch;
  loading: boolean;
};

export type MainQueryResponse = {
  loansResearchMain: { list: ILoanResearch[]; totalCount: number };
  loading: boolean;
  refetch: () => void;
};

export type RemoveMutationResponse = {
  loansResearchRemove: (params: {
    variables: { loanResearchIds: string[] };
  }) => Promise<any>;
};
