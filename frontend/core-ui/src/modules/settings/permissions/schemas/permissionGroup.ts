import { z } from 'zod';

const scopeEnum = z.enum(['own', 'group', 'all']);

export const PERMISSION_GROUP_SCHEMA = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  permissions: z
    .array(
      z.object({
        plugin: z.string().min(1, 'Plugin is required'),
        module: z.string().min(1, 'Module is required'),
        actions: z.array(z.string()).min(1, 'Actions are required'),
        scope: scopeEnum,
      }),
    )
    .min(1, 'Select at least one module permission'),
});

export type IPermissionGroupSchema = z.infer<typeof PERMISSION_GROUP_SCHEMA>;
