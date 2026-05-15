import { z } from 'zod';
import {
  ACCOUNT_PERMISSION_SCOPES,
  ACCOUNT_PERMISSION_WRITE_SCOPES,
} from '../types/Permission';

export const permissionSchema = z.object({
  userId: z.string().min(1, 'Хэрэглэгч заавал сонгоно уу'),
  accountIds: z.array(z.string()).min(1, 'Данс заавал сонгоно уу'),
  level: z.number().int().min(0),
  read: z.enum(ACCOUNT_PERMISSION_SCOPES.VALUES),
  write: z.enum(ACCOUNT_PERMISSION_WRITE_SCOPES.VALUES),
});
