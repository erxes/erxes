export const PROMO_CODE_TYPE = {
  APPSUMO: 'appsumo',
  ALL: ['appsumo'],
};

export const ORGANIZATION_PLAN = {
  LIFETIME: 'lifetime',
  FREE: 'free',
  GROWTH: 'growth',
  ALL: ['lifetime', 'free', 'growth'],
};

export interface IOrganization {
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
  domain?: string;
  textColor?: string;
  lastActiveDate?: Date;
  cronLastExecutedDate?: any;
  createdAt?: Date;
  promoCodes?: string[];
  partnerKey?: string;
  awsSesAccountStatus?: string;
}
