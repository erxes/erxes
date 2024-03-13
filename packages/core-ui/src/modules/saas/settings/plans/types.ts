export type IOrganization = {
  name: string;
  subdomain: string;
  domain?: string;
  description?: string;
  iconColor?: string;
  textColor?: string;
  backgroundColor?: string;
  icon?: string;
  dnsStatus?: string;
  favicon?: string;
  logo?: string;
  createdAt?: Date;
  charge: ICharge;
  promoCodes?: string[];
  isPaid?: boolean;
  isWhiteLabel?: boolean;
  setupService?: any;

  plan?: string;
  expiryDate?: Date;
  customDomainStatus?: any;

  hostNameStatus: string;
  sslStatus: string;
};

export interface IRetrieveUpComingInvoice {
  email: string;
  quantity: number;
  plan: string;
  interval: string;
}

export interface ICharge {
  freeIntegration: IChargeItemInfo;
  teamMember: IChargeItemInfo;
  coc: IChargeItemInfo;
  emailSend: IChargeItemInfo;
  emailVerification: IChargeItemInfo;
  phoneVerification: IChargeItemInfo;
  whiteLabel: IChargeItemInfo;
  'twitter-dm': IChargeItemInfo;
  sms: IChargeItemInfo;
}

export interface IChargeItemInfo {
  free?: number;
  purchased?: number;
  used?: number;
  count?: number;
  subscriptionId?: string;
  interval?: string;
  expiryDate?: Date;
}

export type IChargeItem = {
  name?: string;
  description?: string;
  type: string;
  logo?: string;
  price: number;
  count?: number;
  initialCount?: number;
};

export type IItemChange = {
  kind: string;
  quantity: number;
  count: number;
  prices: { [key: string]: number };
};

export type IPrice = {
  monthly: number;
  yearly: number;
};

// mutation types
export interface IUpgradePlan {
  stripeToken: string;
  stripeEmail: string;
  plan: string;
  interval: string;
  teamMembersCount: number;
}

export type editOrganizationInfoMutationVariables = {
  icon: string;
  logo?: string;
  textColor?: string;
  domain?: string;
  favicon?: string;
  link: string;
  name: string;
  iconColor?: string;
  backgroundColor?: string;
  description?: string;
};

export type editOrganizationDomainMutationVariables = {
  type: string;
  domain: string;
};

export type ChargeUsage = {
  totalAmount: number;
  purchasedAmount: number;
  freeAmount: number;
  promoCodeAmount: number;
  remainingAmount: number;
  usedAmount: number;
};

export type upgradePlanMutationResponse = {
  upgradePlan: (mutation: { variables: IUpgradePlan }) => Promise<any>;
};

export type renewChargeMutationVariables = {
  type: string;
  email: string;
};

export type chargeItemsMutationResponse = {
  chargeItems: (mutation: { variables: IPurchase }) => Promise<any>;
};

export type chargeItemWithCountResponse = {
  name: string;
  type: string;
  count: number;
  initialCount: number;
  free?: number;
  price: IPrice;
  unit?: string;
  comingSoon?: boolean;
  description?: string;
  unLimited?: boolean;

  usage: ChargeUsage;
  title: string;
};

export type getCreditsInfoQueryResponse = {
  getCreditsInfo: chargeItemWithCountResponse[];
  loading: boolean;
};

export type renewChargeMutationResponse = {
  renewCharge: (mutation: {
    variables: renewChargeMutationVariables;
  }) => Promise<any>;
};

export type editOrganizationInfoMutationResponse = {
  editOrganizationMutation: (mutation: {
    variables: editOrganizationInfoMutationVariables;
  }) => Promise<any>;
};

export type editOrganizationDomainMutationResponse = {
  editOrganizationDomainMutation: (mutation: {
    variables: editOrganizationDomainMutationVariables;
  }) => Promise<any>;
};

export type cancelChargeMutationVariables = {
  type: string;
  subscriptionId: string;
};

export type cancelChargeMutationResponse = {
  cancelCharge: (mutation: {
    variables: cancelChargeMutationVariables;
  }) => Promise<any>;
};

export type IPurchase = {
  stripeEmail: string;
  stripePaymentMethod: string;
  itemsQuantity: { [key: string]: number };
  interval?: 'yearly' | 'monthly';
  promoCode?: string;
};
