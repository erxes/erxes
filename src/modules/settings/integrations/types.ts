import { IBrand } from "../brands/types";
import { IChannel } from "../channels/types";

export interface IApps {
  id: string;
  name?: string;
}

export interface IPages {
  id: string;
  name?: string;
  checked?: boolean;
}

export interface IMessengerData {
  welcomeMessage: string;
  awayMessage: string;
  thankYouMessage: string;
  notifyCustomer: boolean;
  supporterIds: string[];
  availabilityMethod: string;
  isOnline: boolean;
  timezone: string;
  onlineHours: any;
}

export interface IUiOptions {
  color: string;
  wallpaper: string;
  logo: string;
}

export interface IFormData {
  loadType?: string;
  successAction?: string;
  fromEmail?: string;
  userEmailTitle?: string;
  userEmailContent?: string;
  adminEmails?: string[];
  adminEmailTitle?: string;
  adminEmailContent?: string;
  thankContent?: string;
  redirectUrl?: string;
}

export interface ITwitterData {
  info?: any;
  token?: string;
  tokenSecret?: string;
}

export interface IFacebookData {
  appId: string;
  pageIds: string[];
}

export interface IIntegration {
    _id: string;
    kind: string;
    name?: string;
    brandId?: string;
    description?: string;
    code: string;
    formId: string;
    form: any;
    logo: string;
    languageCode?: string;
    createUrl: string;
    createModal: string;
    messengerData?: IMessengerData;
    facebookData?: IFacebookData;
    uiOptions?: IUiOptions;

    brand: IBrand;
    channels: IChannel[];
}
