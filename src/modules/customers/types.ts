import { ICompany } from 'modules/companies/types';
import { ITag } from 'modules/tags/types';
import { IUser } from '../auth/types';
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
