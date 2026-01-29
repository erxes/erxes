import { ValidationStatus } from 'erxes-ui';

export interface TCompany {
  _id: string;
  avatar?: string;
  primaryName: string;
  names?: string[];
  primaryEmail?: string;
  emails?: string[];
  primaryPhone?: string;
  phones?: string[];
  tagIds?: string[];
  location?: string;
  businessType?: string;
  code?: string;
  description?: string;
  industry?: string[];
  ownerId?: string;
  parentCompanyId?: string;
  parentCompany?: TCompany;
  plan?: string;
  score?: number;
  size?: number;
  website?: string;
  lastSeenAt?: string;
  emailValidationStatus?: ValidationStatus;
  phoneValidationStatus?: ValidationStatus;
}
