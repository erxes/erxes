import {
  AddMutationResponse as AddMutationResponseC,
  CustomersQueryResponse as CustomersQueryResponseC,
  ICustomer as ICustomerC,
  ICustomerDoc as ICustomerDocC,
  ICustomerLinks as ICustomerLinksC,
  IUrlVisits as IUrlVisitsC,
  IVisitorContact as IVisitorContactC
} from 'erxes-ui/lib/customers/types';
import { QueryResponse } from 'modules/common/types';
import { IActivityLog } from '../activityLogs/types';
import { IIntegration } from '../settings/integrations/types';

export type IVisitorContact = IVisitorContactC;

export type ICustomerLinks = ICustomerLinksC;

export type ICustomerDoc = ICustomerDocC;

export type IUrlVisits = IUrlVisitsC;

export interface ICustomer extends ICustomerC {
  integration?: IIntegration;
}

// mutation types

export type AddMutationResponse = AddMutationResponseC;

export type EditMutationResponse = {
  customersEdit: (doc: { variables: ICustomer }) => Promise<any>;
};

export type RemoveMutationVariables = {
  customerIds: string[];
};

export type RemoveMutationResponse = {
  customersRemove: (doc: {
    variables: RemoveMutationVariables;
  }) => Promise<any>;
};

export type MergeMutationVariables = {
  customerIds: string[];
  customerFields: ICustomer;
};

export type VerifyMutationVariables = {
  verificationType: string;
};

export type VerifyMutationResponse = {
  customersVerify: (doc: {
    variables: VerifyMutationVariables;
  }) => Promise<any>;
};

export type MergeMutationResponse = {
  customersMerge: (doc: { variables: MergeMutationVariables }) => Promise<any>;
};

export type ChangeStateMutationVariables = {
  _id: string;
  value: string;
};

export type ChangeStateMutationResponse = {
  customersChangeState: (doc: {
    variables: ChangeStateMutationVariables;
  }) => Promise<any>;
};

export type ChangeStatusMutationVariables = {
  customerIds: string[];
  type: string;
  status: string;
};

export type ChangeStatusMutationResponse = {
  customersChangeVerificationStatus: (doc: {
    variables: ChangeStatusMutationVariables;
  }) => Promise<any>;
};

// query types
export type ListQueryVariables = {
  page?: number;
  perPage?: number;
  segment?: string;
  tag?: string;
  ids?: string;
  searchValue?: string;
  brand?: string;
  integration?: string;
  form?: string;
  startDate?: string;
  endDate?: string;
  leadStatus?: string;
  sortField?: string;
  sortDirection?: number;
};

export type MainQueryResponse = {
  customersMain: { list: ICustomer[]; totalCount: number };
} & QueryResponse;

type CountResponse = {
  [key: string]: number;
};

type CustomerCounts = {
  byBrand: CountResponse;
  byForm: CountResponse;
  byIntegrationType: CountResponse;
  byLeadStatus: CountResponse;
  bySegment: CountResponse;
  byTag: CountResponse;
};

export type CustomersQueryResponse = CustomersQueryResponseC;

export type CountQueryResponse = {
  customerCounts: CustomerCounts;
} & QueryResponse;

export type CustomerDetailQueryResponse = {
  customerDetail: ICustomer;
  loading: boolean;
};

export type ActivityLogQueryResponse = {
  activityLogs: IActivityLog[];
  subscribeToMore: any;
} & QueryResponse;
