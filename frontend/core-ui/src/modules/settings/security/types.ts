import { CHANGE_PASSWORD_SCHEMA } from '@/settings/security/schema';
import { z } from 'zod';

export interface ChangePasswordResult {
  usersChangePassword: {
    _id: string;
  };
}

export type IChangePassword = z.infer<typeof CHANGE_PASSWORD_SCHEMA>;
