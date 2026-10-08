import { ICompany } from 'erxes-api-shared/core-types';

export type ICpCompanyInput = Pick<
  ICompany,
  | 'avatar'
  | 'primaryName'
  | 'names'
  | 'primaryEmail'
  | 'emails'
  | 'primaryPhone'
  | 'phones'
  | 'primaryAddress'
  | 'addresses'
  | 'size'
  | 'website'
  | 'industry'
  | 'businessType'
  | 'description'
  | 'isSubscribed'
  | 'links'
  | 'propertiesData'
  | 'location'
>;
