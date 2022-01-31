import { QueryResponse } from '../types';
import { ICompany } from '../companies/types';
import { ITag } from '../tags/types';
import { IUser } from '../auth/types';

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
