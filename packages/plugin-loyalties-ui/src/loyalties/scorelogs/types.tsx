export interface ICommonParams {
  page?: number;
  perPage?: number;
  sortField?: string;
  sortDirection?: number;

  searchValue?: string;
  campaignId?: string;
  ownerType?: string;
  ownerId?: string;
  status?: string;
  statuses?: string[];
}
export interface IScoreLogParams {
  changeScore: number;
  createdAt: string;
  createdBy: string;
  description: string;
  owner: Owner;
  ownerId: string;
  ownerType: string;
}

export interface Owner {
  starredConversationIds: any[];
  details: Details;
  isActive: boolean;
  brandIds: any[];
  groupIds: string[];
  deviceTokens: any[];
  doNotDisturb: string;
  isSubscribed: string;
  isShowNotification: boolean;
  score: number;
  role: string;
  _id: string;
  email: string;
  password: string;
  registrationToken: string;
  registrationTokenExpires: string;
  code: string;
  createdAt: string;
  emailSignatures: any[];
  customFieldsData: any[];
  __v: number;
  links: Links;
  username: string;
}

export interface Details {
  avatar: string;
  fullName: string;
  shortName: string;
  birthDate: string;
  position: string;
  workStartedDate: string;
  location: string;
  description: string;
  operatorPhone: string;
}

export interface Links {
  facebook: string;
  twitter: string;
  youtube: string;
  website: string;
}
