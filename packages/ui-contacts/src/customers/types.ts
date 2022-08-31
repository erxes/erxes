import { Counts, QueryResponse } from '@erxes/ui/src/types';

import { IActivityLog } from '@erxes/ui-log/src/activityLogs/types';
import { ICompany } from '../companies/types';
import { ITag } from '@erxes/ui-tags/src/types';
import { IUser } from '@erxes/ui/src/auth/types';

export interface IVisitorContact {
  email?: string;
  phone?: string;
}
export interface ICustomerLinks {
  website?: string;
  facebook?: string;
  twitter?: string;
  linkedIn?: string;
  youtube?: string;
  github?: string;
}

export interface ICustomerDoc {
  firstName?: string;
  middleName?: string;
  lastName?: string;
  phones?: string[];
  sex?: number;
  primaryPhone?: string;
  primaryEmail?: string;
  emails?: string[];
  avatar?: string;
  state?: string;
  ownerId?: string;
  position?: string;
  location?: {
    userAgent?: string;
    country?: string;
    countryCode?: string;
    remoteAddress?: string;
    hostname?: string;
    language?: string;
  };
  department?: string;
  leadStatus?: string;
  hasAuthority?: string;
  description?: string;
  isSubscribed?: string;
  links?: ICustomerLinks;
  customFieldsData?: { [key: string]: any };
  visitorContactInfo?: IVisitorContact;
  code?: string;
  birthDate?: string;
  emailValidationStatus?: string;
  phoneValidationStatus?: string;

  isOnline?: boolean;
  lastSeenAt?: number;
  sessionCount?: number;
  score?: number;
}

export interface IUrlVisits {
  url: string;
  count: number;
  createdAt: string;
}

export interface ICustomer extends ICustomerDoc {
  _id: string;
  owner?: IUser;
  integration?: any;
  trackedData?: any[];
  urlVisits?: IUrlVisits[];
  getTags?: ITag[];
  companies?: ICompany[];
}

export type AddMutationResponse = {
  customersAdd: (params: { variables: ICustomerDoc }) => Promise<any>;
};

export type CustomersQueryResponse = {
  customers: ICustomer[];
} & QueryResponse;

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

type CustomerCounts = {
  byBrand: Counts;
  byForm: Counts;
  byIntegrationType: Counts;
  byLeadStatus: Counts;
  bySegment: Counts;
  byTag: Counts;
};

export type CountQueryResponse = {
  customerCounts: CustomerCounts;
} & QueryResponse;

export type IntegrationGetUsedQueryResponse = {
  integrationsGetUsedTypes: Array<{ _id: string; name: string }>;
} & QueryResponse;

export type CustomerDetailQueryResponse = {
  customerDetail: ICustomer;
  loading: boolean;
};

export type ActivityLogQueryResponse = {
  activityLogs: IActivityLog[];
  subscribeToMore: any;
} & QueryResponse;

export interface IFieldsVisibility {
  [key: string]: string;
}
