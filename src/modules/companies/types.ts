import { ITag } from 'modules/tags/types';
import { IActivityLog, IActivityLogForMonth } from '../activityLogs/types';
import { IUser } from '../auth/types';
import { ICustomer } from '../customers/types';
import { ISegmentDoc } from '../segments/types';

export interface ICompanyLinks {
  linkedIn?: string;
  twitter?: string;
  facebook?: string;
  github?: string;
  youtube?: string;
  website?: string;
}

export interface ICompanyDoc {
  createdAt?: Date;
  modifiedAt?: Date;
  avatar?: string;

  primaryName?: string;
  names?: string[];
  size?: number;
  industry?: string;
  website?: string;
  plan?: string;
  parentCompanyId?: string;

  ownerId?: string;

  emails?: string[];
  primaryEmail?: string;

  primaryPhone?: string;
  phones?: string[];

  leadStatus?: string;
  lifecycleState?: string;
  businessType?: string;
  description?: string;
  employees?: number;
  doNotDisturb?: string;
  links: ICompanyLinks;
  tagIds?: string[];
  customFieldsData?: any;
}

export interface IActivityLogYearMonthDoc {
  year: number;
  month: number;
}

export interface ICompanyActivityLog {
  date: IActivityLogYearMonthDoc;
  list: IActivityLog[];
}

export interface ICompany extends ICompanyDoc {
  _id: string;
  owner: IUser;
  parentCompany: ICompany;
  getTags: ITag[];
  customers: ICustomer[];
}

// mutation types

export type EditMutationResponse = {
  companiesEdit: (params: { variables: ICompany }) => Promise<any>;
};

export type RemoveMutationVariables = {
  companyIds: string[];
};

export type RemoveMutationResponse = {
  companiesRemove: (
    params: { variables: RemoveMutationVariables }
  ) => Promise<any>;
};

export type MergeMutationVariables = {
  companyIds: string[];
  companyFields: any;
};

export type MergeMutationResponse = {
  companiesMerge: (
    params: { variables: MergeMutationVariables }
  ) => Promise<any>;
};

export type CustomersEditCompaniesMutationVariables = {
  _id: string;
  companyIds: string[];
};

export type CustomersEditCompaniesMutationResponse = {
  customersEditCompanies: (
    params: {
      variables: CustomersEditCompaniesMutationVariables;
    }
  ) => Promise<any>;
};

export type AddMutationResponse = {
  companiesAdd: (params: { variables: ICompanyDoc }) => Promise<any>;
};

// query types

export type ListQueryVariables = {
  page?: number;
  perPage?: number;
  segment?: string;
  tag?: string;
  brand?: string;
  ids?: string[];
  searchValue?: string;
  leadStatus?: string;
  lifecycleState?: string;
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
  loading: boolean;
  refetch: () => void;
};

export type CompaniesQueryResponse = {
  companies: ICompany[];
  loading: boolean;
  refetch: () => void;
};

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
  byFakeSegment: number;
  byTag: Count;
  byBrand: Count;
  byLeadStatus: Count;
  byLifecycleState: Count;
};

export type CountQueryResponse = {
  companyCounts: CompanyCounts;
  loading: boolean;
  refetch: (variables?: { byFakeSegment?: ISegmentDoc }) => void;
};
