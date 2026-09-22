export interface IOrganization {
  _id?: string;
  name: string;
  subdomain: string;
  ownerId: string;
  plan: string;
  expiryDate: string;
  icon: string;
  teamMembersLimit: number;
  interval: string;
  charge: any;

  logo?: string;
  favicon?: string;
  iconColor?: string;
  description?: string;
  dnsStatus?: string;
  backgroundColor?: string;
  isWhiteLabel?: boolean;
  isNext?: boolean;
  bundleId?: string;
  domain?: string;
  textColor?: string;
  lastActiveDate?: Date;
  cronLastExecutedDate?: any;
  createdAt?: Date;
  promoCodes?: string[];
  partnerKey?: string;
  awsSesAccountStatus?: string;
}

export interface ISaasBundle {
  _id?: string;
  title?: string;
  type?: string;
  isFree?: boolean;
  pluginsLimits?: Record<string, unknown>;
}

export interface ISaasAddon {
  _id?: string;
  kind?: string;
  quantity?: number;
  installationId?: string;
  subscriptionId?: string;
  expiryDate?: Date;
  interval?: string;
  paymentStatus?: string;
  paymentStatusMessage?: string;
  isCanceled?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  bundle?: ISaasBundle;
}

export interface ISaasOrganizationPlanHistory {
  _id?: string;
  organizationId: string;
  source?: string;
  status?: string;
  isNext?: boolean;
  productId?: string;
  bundleId?: string;
  interval?: string;
  pluginsLimitsSnapshot?: Record<string, unknown>;
  assistantLimit?: number;
  stripeCheckoutSessionId?: string;
  stripePaymentIntentId?: string;
  stripeSubscriptionId?: string;
  stripeInvoiceId?: string;
  startsAt?: Date;
  endsAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
  bundle?: ISaasBundle;
}
