import { z } from 'zod';

export const EMAPPEARANCE_SCHEMA = z.object({
  primary: z
    .object({
      DEFAULT: z.string(),
      foreground: z.string(),
    })
    .optional()
    .nullable(),
  logo: z.string().optional(),
  launcherLogo: z.string().optional(),
  backgroundColor: z.string().optional(),
  heroStyleVariant: z.enum(['glossy', 'aurora', 'mesh', 'flat']).optional(),
  navigationVariant: z.enum(['pill', 'fluid']).optional(),
});
