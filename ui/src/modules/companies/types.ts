import {
  AddMutationResponse as AddMutationResponseC,
  CompaniesQueryResponse as CompaniesQueryResponseC,
  ICompany as ICompanyC,
  ICompanyDoc as ICompanyDocC,
  ICompanyLinks as ICompanyLinksC
} from 'erxes-ui/lib/companies/types';
import { QueryResponse } from 'modules/common/types';
import { IActivityLog, IActivityLogForMonth } from '../activityLogs/types';

export type ICompanyLinks = ICompanyLinksC;

export type ICompanyDoc = ICompanyDocC;

export interface IActivityLogYearMonthDoc {
  year: number;
  month: number;
}

export interface ICompanyActivityLog {
  date: IActivityLogYearMonthDoc;
  list: IActivityLog[];
}

export type ICompany = ICompanyC & { trackedData?: any };

// mutation types

export type EditMutationResponse = {
  companiesEdit: (params: { variables: ICompany }) => Promise<any>;
};

export type RemoveMutationVariables = {
  companyIds: string[];
};

export type RemoveMutationResponse = {
  companiesRemove: (params: {
    variables: RemoveMutationVariables;
  }) => Promise<any>;
};

export type MergeMutationVariables = {
  companyIds: string[];
  companyFields: any;
};

export type MergeMutationResponse = {
  companiesMerge: (params: {
    variables: MergeMutationVariables;
  }) => Promise<any>;
};

export type AddMutationResponse = AddMutationResponseC;

// query types
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

type ListConfig = {
  name: string;
  label: string;
  order: number;
};

export type MainQueryResponse = {
  companiesMain: { list: ICompany[]; totalCount: number };
} & QueryResponse;

export type CompaniesQueryResponse = CompaniesQueryResponseC;

export type ListConfigQueryResponse = {
  fieldsDefaultColumnsConfig: ListConfig[];
  loading: boolean;
};

export type DetailQueryResponse = {
  companyDetail: ICompany;
  loading: boolean;
};

export type ActivityLogQueryResponse = {
  activityLogs: IActivityLogForMonth[];
  loading: boolean;
};

type Count = {
  [key: string]: number;
};

type CompanyCounts = {
  bySegment: Count;
  byTag: Count;
  byBrand: Count;
  byLeadStatus: Count;
};

export type CountQueryResponse = {
  companyCounts: CompanyCounts;
} & QueryResponse;
