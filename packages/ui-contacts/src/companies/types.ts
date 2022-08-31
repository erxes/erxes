import { ICustomer } from '@erxes/ui-contacts/src/customers/types';
import { ITag } from '@erxes/ui-tags/src/types';
import { IUser } from '@erxes/ui/src/auth/types';
import { QueryResponse } from '@erxes/ui/src/types';

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
  state?: string;
  parentCompanyId?: string;

  ownerId?: string;

  emails?: string[];
  primaryEmail?: string;

  primaryPhone?: string;
  phones?: string[];

  businessType?: string;
  description?: string;
  employees?: number;
  isSubscribed?: string;

  links: ICompanyLinks;
  tagIds?: string[];
  customFieldsData?: any;
  trackedData?: any[];
  code?: string;
  location?: string;
  score?: number;
}

export interface ICompany extends ICompanyDoc {
  _id: string;
  owner: IUser;
  parentCompany: ICompany;
  getTags: ITag[];
  customers: ICustomer[];
}

export type CompaniesQueryResponse = {
  companies: ICompany[];
} & QueryResponse;

export type AddMutationResponse = {
  companiesAdd: (params: { variables: ICompanyDoc }) => Promise<any>;
};
