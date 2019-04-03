import { ICompany } from 'modules/companies/types';
import { ITag } from 'modules/tags/types';
import { IActivityLogForMonth } from '../activityLogs/types';
import { IUser } from '../auth/types';
import { ISegmentDoc } from '../segments/types';
import { IIntegration } from '../settings/integrations/types';

export interface IMessengerData {
  lastSeenAt?: number;
  sessionCount?: number;
  isActive?: boolean;
  customData?: any;
}

export interface ITwitterData {
  id?: number;
  id_str?: string;
  name?: string;
  screen_name?: string;
  profile_image_url?: string;
}

export interface IFacebookData {
  id: string;
  profilePic?: string;
}

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
  firstName: string;
  lastName: string;
  phones?: string[];
  primaryPhone?: string;
  primaryEmail?: string;
  emails?: string[];
  avatar?: string;
  isUser?: boolean;
  ownerId?: string;
  position?: string;
  location?: {
    userAgent?: string;
    country?: string;
    remoteAddress?: string;
    hostname?: string;
    language?: string;
  };
  department?: string;
  leadStatus?: string;
  lifecycleState?: string;
  hasAuthority?: string;
  description?: string;
  doNotDisturb?: string;
  links?: ICustomerLinks;
  twitterData?: ITwitterData;
  facebookData?: IFacebookData;
  messengerData?: IMessengerData;
  customFieldsData?: { [key: string]: any };
  visitorContactInfo?: IVisitorContact;
}

export interface ICustomer extends ICustomerDoc {
  _id: string;
  owner?: IUser;
  integration?: IIntegration;
  getMessengerCustomData?: any;
  getTags: ITag[];
  companies: ICompany[];
}

// mutation types

export type AddMutationResponse = {
  customersAdd: (params: { variables: ICustomerDoc }) => Promise<any>;
};

export type EditMutationResponse = {
  customersEdit: (doc: { variables: ICustomer }) => Promise<any>;
};

export type RemoveMutationVariables = {
  customerIds: string[];
};

export type RemoveMutationResponse = {
  customersRemove: (
    doc: {
      variables: RemoveMutationVariables;
    }
  ) => Promise<any>;
};

export type MergeMutationVariables = {
  customerIds: string[];
  customerFields: ICustomer;
};

export type MergeMutationResponse = {
  customersMerge: (
    doc: {
      variables: MergeMutationVariables;
    }
  ) => Promise<any>;
};

export type CompaniesEditCustomersMutationVariables = {
  _id: string;
  customerIds: string[];
};

export type CompaniesEditCustomersMutationResponse = {
  companiesEditCustomers: (
    doc: {
      variables: CompaniesEditCustomersMutationVariables;
    }
  ) => Promise<any>;
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
  lifecycleState?: string;
  sortField?: string;
  sortDirection?: number;
};

export type MainQueryResponse = {
  customersMain: { list: ICustomer[]; totalCount: number };
  loading: boolean;
  refetch: () => void;
};

type CountResponse = {
  [key: string]: number;
};

type CustomerCounts = {
  byBrand: CountResponse;
  byFakeSegment: number;
  byForm: CountResponse;
  byIntegrationType: CountResponse;
  byLeadStatus: CountResponse;
  byLifecycleState: CountResponse;
  bySegment: CountResponse;
  byTag: CountResponse;
};

export type CustomersQueryResponse = {
  customers: ICustomer[];
  loading: boolean;
  refetch: () => void;
};

export type CountQueryResponse = {
  customerCounts: CustomerCounts;
  loading: boolean;
  refetch: (variables?: { byFakeSegment?: ISegmentDoc }) => void;
};

export type CustomerDetailQueryResponse = {
  customerDetail: ICustomer;
  loading: boolean;
};

export type ActivityLogQueryResponse = {
  activityLogs: IActivityLogForMonth[];
  loading: boolean;
};
