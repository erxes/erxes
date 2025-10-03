import { USERS_GROUP_FORM_SCHEAMA } from '@/settings/permission/schema/usersGroup';
import { z } from 'zod';

export interface IPermission {
  _id: string;
  module?: string;
  action?: string;
  userId?: string;
  groupId?: string;
  allowed?: boolean;
  group?: {
    _id: string;
    name?: string;
  };
  user?: {
    _id: string;
    username?: string;
    email?: string;
  };
}

export interface IUsersGroup {
  _id: string;
  name: string;
  members: {
    _id: string;
    isActive: boolean;
    details: {
      avatar: string;
      fullName: string;
    };
  }[];
  description: string;
}

export type IUsersGroupFormSchema = z.infer<typeof USERS_GROUP_FORM_SCHEAMA>;
