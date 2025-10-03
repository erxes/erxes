export interface IPSS {
  profileScore: string;
  searchText: string;
  state: string;
}

export interface IGetCustomerParams {
  email?: string;
  phone?: string;
  code?: string;
  integrationId?: string;
  cachedCustomerId?: string;
}

export interface ICreateMessengerCustomerParams {
  doc: {
    integrationId: string;
    email?: string;
    emailValidationStatus?: string;
    phone?: string;
    phoneValidationStatus?: string;
    code?: string;
    isUser?: boolean;
    firstName?: string;
    lastName?: string;
    middleName?: string;
    description?: string;
    deviceToken?: string;
  };
  customData?: any;
}

export interface IUpdateMessengerCustomerParams {
  _id: string;
  doc: {
    integrationId: string;
    email?: string;
    phone?: string;
    code?: string;
    isUser?: boolean;
    deviceToken?: string;
  };
  customData?: any;
}

export interface IVisitorContactInfoParams {
  customerId: string;
  visitorId?: string;
  type: string;
  value: string;
}

export interface IBrowserInfo {
  language?: string;
  url?: string;
  city?: string;
  countryCode?: string;
}
