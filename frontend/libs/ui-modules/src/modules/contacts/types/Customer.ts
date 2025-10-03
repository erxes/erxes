import { SexCode, ValidationStatus } from 'erxes-ui';
import { CountryCode } from 'libphonenumber-js';
import { ICompany } from './Company';
import { IUser } from 'ui-modules/modules/team-members';

export interface ICustomerInline {
  _id: string;
  firstName?: string;
  lastName?: string;
  middleName?: string;
  primaryEmail?: string;
  primaryPhone?: string;
  avatar?: string;
}
export interface ICustomer extends ICustomerInline {
  type?: CustomerType;
  links?: object;
  code?: string;
  emailValidationStatus?: ValidationStatus;
  phoneValidationStatus?: ValidationStatus;
  emails?: string[];
  phones?: string[];
  tagIds?: string[];
  isSubscribed?: string;
  description?: string;
  ownerId?: string;
  score?: number;
  location?: {
    countryCode?: CountryCode | undefined;
  };
  sex?: SexCode;
  owner?: IUser;
}

export interface ICustomerDetail extends ICustomer {
  companies?: ICompany[];
  position?: string;
  department?: string;
}

export enum CustomerType {
  CUSTOMER = 'customer',
  COMPANY = 'company',
  USER = 'user',
}
