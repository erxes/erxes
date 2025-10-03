import { CountryCode } from 'libphonenumber-js';
export interface ICustomer {
  _id: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  primaryEmail?: string;
  primaryPhone?: string;
  isSubscribed?: boolean;
  links?: object;
  code?: string;
  emailValidationStatus?: string;
  phoneValidationStatus?: string;
  emails?: string[];
  phones?: string[];
  tagIds?: string[];
  location?: {
    countryCode?: CountryCode | undefined;
  };
}

export interface SelectUserFetchMoreProps {
  fetchMore: () => void;
  usersLength: number;
  totalCount: number;
}
