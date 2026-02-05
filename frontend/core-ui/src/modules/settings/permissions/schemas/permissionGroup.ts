import { z } from 'zod';

export const PERMISSION_GROUP_SCHEMA = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  permissions: z.array(
    z.object({
      module: z.string().min(1, 'Module is required'),
      actions: z.array(z.string()).min(1, 'Actions are required'),
      scope: z.string().min(1, 'Scope is required'),
    }),
  ),
});

export type IPermissionGroupSchema = z.infer<typeof PERMISSION_GROUP_SCHEMA>;
