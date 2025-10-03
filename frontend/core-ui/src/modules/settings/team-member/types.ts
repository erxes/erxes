import { z } from 'zod';
import {
  USER_SUBMIT_SCHEMA,
  USER_DETAIL_SCHEMA,
} from '@/settings/team-member/schema/users';
import { CountryCode } from 'libphonenumber-js';

export interface IUserInline {
  _id: string;
  details: IDetailsType;
}

export interface IDetailsType {
  avatar: string;
  fullName: string;
  firstName: string;
  lastName: string;
  workStartedDate: Date;
  location?: {
    countryCode?: CountryCode | undefined;
  };
  operatorPhone?: string;
  middleName?: string;
  shortName?: string;
  description?: string;
  birthDate?: Date;
}

export enum EStatus {
  Verified = 'Verified',
  NotVerified = 'Not verified',
}

export interface IUser extends IUserInline {
  email: string;
  status: EStatus;
  employeeId: string;
  isActive: boolean;
  positionIds: string[];

  links?: object;
  isSubscribed?: string;
  score?: number;
  username?: string;
}

export interface IUserDetail extends IUser {
  branchIds?: string[];
  departmentIds?: string[];
}

export interface IUserEntry {
  email: string;
  password: string;
}

export type TUserInviteVars = {
  entries: IUserEntry[];
};
export interface IUserInviteContext {
  selectedUsers: string[];
  setSelectedUsers: (selectedUsers: string[]) => void;
  fields: IUserEntry & { id: string }[];
}
export interface IInviteUserRowContext {
  userIndex: number;
  user: IUserEntry & { id: string };
}
export interface IBranch {
  _id: string;
  title: string;
  code: string;
  parentId: string;
}
export type TUserForm = z.infer<typeof USER_SUBMIT_SCHEMA>;
export type TUserDetailForm = z.infer<typeof USER_DETAIL_SCHEMA>;

export enum UsersHotKeyScope {
  UsersPage = 'users-page',
  UserDetailPage = 'user-detail-page',
  UserAddSheet = 'user-add-sheet',
  UserEditSheet = 'user-edit-sheet',
}

export interface UserLinks {
  facebook?: string;
  twitter?: string;
  website?: string;
  discord?: string;
  github?: string;
  instagram?: string;
}
