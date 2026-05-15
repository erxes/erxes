import { z } from 'zod';
import { permissionSchema } from '../constants/permissionSchema';

export type TPermissionForm = z.infer<typeof permissionSchema>;
