import { ICompany } from '@erxes/ui-contacts/src/companies/types';

export interface IInsuranceTypeDoc {
  createdAt?: Date;
  code: string;
  name?: string;
  description?: string;
  companyId?: string;
  percent: number;
  yearPercents: string;
}

export interface IInsuranceType extends IInsuranceTypeDoc {
  _id: string;
  company?: ICompany;
}

// mutation types

export type EditMutationResponse = {
  insuranceTypesEdit: (params: { variables: IInsuranceType }) => Promise<any>;
};

export type RemoveMutationVariables = {
  insuranceTypeIds: string[];
};

export type RemoveMutationResponse = {
  insuranceTypesRemove: (params: {
    variables: RemoveMutationVariables;
  }) => Promise<any>;
};

export type MergeMutationVariables = {
  insuranceTypeIds: string[];
  insuranceTypeFields: any;
};

export type MergeMutationResponse = {
  insuranceTypesMerge: (params: {
    variables: MergeMutationVariables;
  }) => Promise<any>;
};

export type AddMutationResponse = {
  insuranceTypesAdd: (params: { variables: IInsuranceTypeDoc }) => Promise<any>;
};

// query types

export type ListQueryVariables = {
  page?: number;
  perPage?: number;
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
  insuranceTypesMain: { list: IInsuranceType[]; totalCount: number };
  loading: boolean;
  refetch: () => void;
};

export type InsuranceTypesQueryResponse = {
  insuranceTypes: IInsuranceType[];
  loading: boolean;
  refetch: () => void;
};

export type ListConfigQueryResponse = {
  fieldsDefaultColumnsConfig: ListConfig[];
  loading: boolean;
};

export type DetailQueryResponse = {
  insuranceTypeDetail: IInsuranceType;
  loading: boolean;
};

export type CountQueryResponse = {
  loading: boolean;
  refetch: () => void;
};
