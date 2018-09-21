import { ITag } from "modules/tags/types";
import { IUser } from "../auth/types";
import { IIntegration } from "../settings/integrations/types";

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
  links?: {
    website?: string;
    facebook?: string;
    twitter?: string;
    linkedIn?: string;
    youtube?: string;
    github?: string;
  };
  twitterData?: { [key: string]: any };
  facebookData?: { [key: string]: any };
  messengerData?: { [key: string]: any };
  customFieldsData?: { [key: string]: any };
  visitorContactInfo?: { [key: string]: any };
}

export interface ICustomer extends ICustomerDoc {
  _id: string;
  owner?: IUser;
  integration?: IIntegration;
  getMessengerCustomData?: any;
  getTags: ITag[];
}
