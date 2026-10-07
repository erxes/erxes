export interface ISaasHelpCenterDomainRecord {
  name: string;
  value: string;
}

export interface ISaasHelpCenterDomain {
  hostname: string;
  // The help center the domain serves. Unset on a domain connected before
  // domains were per help center: it serves the workspace's default one.
  helpCenterId?: string;
  cloudflareId?: string;
  // Cloudflare custom hostname status: pending, active, moved, blocked, ...
  status?: string;
  sslStatus?: string;
  // Whether the hostname CNAMEs to the tenant's help center: pending or active
  dnsStatus?: string;
  ownershipVerification?: ISaasHelpCenterDomainRecord;
  sslValidationRecords?: ISaasHelpCenterDomainRecord[];
  verificationErrors?: string[];
  // While pending, checked in the background until this date; unset once active
  autoCheckUntil?: Date;
  lastCheckedAt?: Date;
  createdAt?: Date;
}

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
  customDomainStatus?: Record<string, unknown>;
  hostNameStatus?: string;
  sslStatus?: string;
  // Legacy single domain, moved into helpCenterDomains on the next write
  helpCenterDomain?: ISaasHelpCenterDomain;
  helpCenterDomains?: ISaasHelpCenterDomain[];
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
