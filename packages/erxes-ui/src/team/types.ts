import { IAttachment, QueryResponse } from '@erxes/ui/src/types';
import {
  IUser,
  IUserDetails,
  IUserDoc,
  IUserLinks
} from '@erxes/ui/src/auth/types';

export type IInvitationEntry = {
  email: string;
  password: string;
  groupId: string;
  channelIds: string[];
  departmentId: string;
  unitId: string;
  branchId: string;
};

export type UserMutationVariables = {
  username: string;
  email: string;
  details?: IUserDetails;
  links?: IUserLinks;
  channelIds?: [string];
  password: string;
  passwordConfirmation: string;
};

export type UsersQueryResponse = {
  users: IUser[];
} & QueryResponse;

export type AllUsersQueryResponse = {
  allUsers: IUser[];
} & QueryResponse;

export type UserDetailQueryResponse = {
  userDetail: IUser;
} & QueryResponse;

export type CountQueryResponse = {
  usersTotalCount: {
    bySegment: { [key: string]: number };
  };
} & QueryResponse;

export type EditMutationResponse = {
  usersEdit: (params: {
    variables: { _id: string } & IUserDoc;
  }) => Promise<any>;
};

export type UserConverationsQueryResponse = {
  userConversations: {
    list: any[]; //check - IConversation
    totalCount: number;
  };
} & QueryResponse;

export type ConfirmMutationVariables = {
  token: string;
  password: string;
  passwordConfirmation: string;
  fullName: string;
  username: string;
};

export type ConfirmMutationResponse = {
  usersConfirmInvitation: (params: {
    variables: ConfirmMutationVariables;
  }) => Promise<any>;
};

export type ResetMemberPasswordResponse = {
  usersResetMemberPassword: (params: {
    variables: { _id: string; newPassword: string };
  }) => Promise<any>;
};

interface IStructureCommon {
  _id: string;
  title: string;
  code: string;
  supervisorId: string;
  supervisor: IUser;
}

export interface IDepartment extends IStructureCommon {
  description: string;
  parentId?: string | null;
  order: string;
  userIds: string[];
  userCount: number;
  users: IUser;
}

export interface IUnit extends IStructureCommon {
  departmentId: string;
  department: IDepartment;
  description: string;
  userIds: string[];
  users: IUser;
}

interface IContactInfo {
  phoneNumber?: string;
  email?: string;
  links?: any;
  coordinate?: any;
  image?: IAttachment;
}

export interface IBranch extends IStructureCommon, IContactInfo {
  address: string;
  parentId: string | null;
  parent: IBranch;
  order: string;
  userIds: string[] | string;
  userCount: number;
  users: IUser[];
  radius: number;
}

export interface IStructure extends IStructureCommon, IContactInfo {
  description?: string;
}

export type UnitsQueryResponse = {
  units: IUnit[];
} & QueryResponse;

export type BranchesQueryResponse = {
  branches: IBranch[];
} & QueryResponse;

export type DepartmentsQueryResponse = {
  departments: IDepartment[];
} & QueryResponse;

export type DepartmentsMainQueryResponse = {
  departmentsMain: {
    list: IDepartment[];
    totalCount: number;
  };
} & QueryResponse;

export type BranchesMainQueryResponse = {
  branchesMain: {
    list: IDepartment[];
    totalCount: number;
  };
} & QueryResponse;

export type IUserMovement = {
  _id: string;
  contentType: string;
  contentTypeId: string;
  contentTypeDetail: IBranch | IDepartment;
  createAt: string;
  createdBy: string;
  createdByDetail: IUser;
  userId: string;
  userDetail: IUser;
};

export type UserMovementsQueryResponse = {
  userMovements: IUserMovement[];
} & QueryResponse;
