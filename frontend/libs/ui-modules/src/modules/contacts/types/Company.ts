export interface ICompany {
  _id: string;
  avatar?: string;
  primaryName?: string;
  names?: string[];
  primaryEmail?: string;
  emails?: string[];
  emailValidationStatus?: 'valid' | 'invalid';
  primaryPhone?: string;
  phones?: string[];
  phoneValidationStatus?: 'valid' | 'invalid';
  ownerId?: string;
  isSubscribed?: string;
  description?: string;
  code?: string;
  tagIds?: string[];
  score?: number;
  location?: string;
}
