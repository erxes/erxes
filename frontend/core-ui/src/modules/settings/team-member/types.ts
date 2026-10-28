import { CountryCode } from 'libphonenumber-js';
import {
  IStructureEntity,
  IStructureEntityMember,
  IStructureEntityType,
  IStructureSeat,
} from 'ui-modules';

export interface IUserInline {
  _id: string;
  details: IUserDetailsType;
}

export interface IUserDetailsType {
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

export interface IUserStructureMembershipSeat
  extends Pick<IStructureSeat, '_id' | 'coverage'> {
  position?: { _id: string; name: string };
}

export interface IUserStructureMembership
  extends Pick<
    IStructureEntityMember,
    '_id' | 'entityId' | 'seatIds' | 'isPrimary'
  > {
  seats?: IUserStructureMembershipSeat[];
  entity?: Pick<
    IStructureEntity,
    '_id' | 'typeId' | 'title' | 'code' | 'order'
  > & {
    type?: Pick<IStructureEntityType, '_id' | 'name' | 'code'>;
  };
}

export interface IUser extends IUserInline {
  email: string;
  status: EStatus;
  employeeId: string;
  isActive: boolean;
  isOwner?: boolean;
  structureMemberships?: IUserStructureMembership[];

  links?: object;
  isSubscribed?: string;
  score?: number;
  username?: string;
  propertiesData?: Record<string, unknown>;
}

export interface IInvitationEntry {
  email: string;
  entityId?: string;
  seatIds?: string[];
}

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
