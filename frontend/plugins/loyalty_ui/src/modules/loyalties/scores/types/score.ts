export interface IScoreOwner {
  _id?: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  primaryEmail?: string;
  primaryPhone?: string;
  email?: string;
  phone?: string;
  // user specific
  details?: {
    firstName?: string;
    lastName?: string;
    fullName?: string;
  };
  // company specific
  primaryName?: string;
}

export interface IScoreLog {
  _id: string;
  ownerId: string;
  ownerType: string;
  owner?: IScoreOwner;
  totalScore?: number;
  change?: number;
  action?: string;
  description?: string;
  campaignId?: string;
  campaign?: { _id: string; title: string };
  targetId?: string;
  target?: { _id?: string; number?: string };
  serviceName?: string;
  createdBy?: string;
  createdAt?: string;
  amount?: number;
  quantity?: number;
}

export type IScoreLogItem = IScoreLog;
