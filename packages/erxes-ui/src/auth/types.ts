import { QueryResponse } from '../types';
import { IBrand } from '../brands/types';

export interface IOnboardingHistory {
  _id: string;
  userId: string;
  isCompleted?: boolean;
  completedSteps: string[];
}

export interface IEmailSignature {
  brandId?: string;
  signature?: string;
}

export interface IUserDetails {
  avatar?: string;
  fullName?: string;
  shortName?: string;
  description?: string;
  birthDate?: Date;
  position?: string;
  workStartedDate?: Date;
  location?: string;
  operatorPhone?: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
}

export interface IUserLinks {
  facebook?: string;
  twitter?: string;
  linkedIn?: string;
  youtube?: string;
  github?: string;
  website?: string;
}

export interface IUserConversation {
  list: any[];
  totalCount: number;
}

export interface IUserDoc {
  createdAt?: Date;
  username: string;
  email: string;
  isActive?: boolean;
  details?: IUserDetails;
  isOwner?: boolean;
  status?: string;
  links?: IUserLinks;
  getNotificationByEmail?: boolean;
  participatedConversations?: IUserConversation[];
  permissionActions?: string[];
  configs?: any;
  configsConstants?: any;
  score?: number;
  branchIds: string[];
  departmentIds: string[];
  employeeId?: string;
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

export declare type IOrganization = {
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
  bundleNames?: string[];
  experienceName?: string;
};

export interface IUserOrganization {
  _id: string;
  createdUserEmail: string;
  createdUserId: string;
  name: string;
  subdomain: string;
}

export interface IUser extends IUserDoc {
  _id: string;
  brands?: IBrand[];
  emailSignatures?: IEmailSignature[];
  onboardingHistory?: IOnboardingHistory;
  branchIds: string[];
  departmentIds: string[];
  customFieldsData?: {
    [key: string]: any;
  };
  isShowNotification?: boolean;
  isSubscribed?: boolean;
  organizations: IUserOrganization[];
  currentOrganization: IOrganization;
}

export type AllUsersQueryResponse = {
  allUsers: IUser[];
} & QueryResponse;

export type CurrentUserQueryResponse = {
  currentUser: IUser;
  loading: boolean;
  subscribeToMore: any;
  refetch: () => void;
};

export type UsersQueryResponse = {
  users: IUser[];
} & QueryResponse;

export type UserDetailQueryResponse = {
  userDetail: IUser;
} & QueryResponse;
