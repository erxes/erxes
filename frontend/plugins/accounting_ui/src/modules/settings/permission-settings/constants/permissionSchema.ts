import { z } from 'zod';
import { ACCOUNT_PERMISSIONS } from '../types/Permission';

const readValues = ACCOUNT_PERMISSIONS.READ.map((o) => o.value) as [
  string,
  ...string[],
];
const writeValues = ACCOUNT_PERMISSIONS.WRITE.map((o) => o.value) as [
  string,
  ...string[],
];

export const permissionSchema = z.object({
  userId: z.string().min(1, 'Хэрэглэгч заавал сонгоно уу'),
  accountIds: z.array(z.string()).min(1, 'Данс заавал сонгоно уу'),
  level: z.number().int().min(0),
  read: z.enum(readValues),
  write: z.enum(writeValues),
});
