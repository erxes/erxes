import { ICustomer } from '@erxes/ui-contacts/src/customers/types';
import { IAttachment } from '@erxes/ui/src/types';

export type IIncome = {
  _id: string;
  incomeType: string;
  totalSalaryIncome: number;
  totalMonth: number;

  businessLine: string;
  businessDetails: string;
  businessProfile: string;
  businessIncome: number;
  files: IAttachment[];
};
export type ILoan = {
  _id: string;
  loanType: string;

  loanName: string;
  loanLocation: string;
  startDate: Date;
  closeDate: Date;
  loanAmount: number;

  costName: string;
  costAmount: number;
  files: IAttachment[];
};

export type ILoanResearch = {
  _id: string;
  dealId: string;
  customerType: string;
  customerId: string;
  debtIncomeRatio: number;
  increaseMonthlyPaymentAmount: number;

  averageSalaryIncome: number;
  averageBusinessIncome: number;
  totalIncome: number;
  incomes: IIncome[];

  monthlyCostAmount: number;
  monthlyLoanAmount: number;
  totalPaymentAmount: number;
  loans: ILoan[];

  customer: ICustomer;
  deal: any;

  createdAt: Date;
  modifiedAt: Date;
};

export type MainQueryResponse = {
  loansResearchMain: { list: ILoanResearch[]; totalCount: number };
  loading: boolean;
  refetch: () => void;
};

export type DetailQueryResponse = {
  loanResearchDetail: ILoanResearch;
  loading: boolean;
};

export type RemoveMutationResponse = {
  loansResearchRemove: (params: {
    variables: { loanResearchIds: string[] };
  }) => Promise<any>;
};
