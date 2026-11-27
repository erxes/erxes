import { oc } from '@orpc/contract';
import { z } from 'zod';
import { isoDate } from './common';
import { COMMON_ERRORS } from './errors';
import { PluginAccess } from './saas';

/** Where a self-hosted server's erxes license comes from. */
export const LICENSE_SOURCES = [
  /** `ERXES_ACTIVATION_KEY`: core fetches it from erxes.io every day. */
  'activation',
  /** `ERXES_LICENSE`: given by hand, for a server without internet. */
  'file',
] as const;

export const LicenseStatus = z.object({
  /** True on erxes.io: the plan decides what each plugin may do, and there is no license. */
  saas: z.boolean(),
  /** Where the license comes from; null when neither setting is there. */
  source: z.enum(LICENSE_SOURCES).nullable(),
  /** The license in force, verified with erxes' keys; null without one. */
  license: z
    .object({
      /** Whom it is issued to. */
      customer: z.string(),
      plugins: z.array(z.string()),
      /** Its last moment; its plugins read for `graceDays` after it, then stop. */
      until: isoDate(),
      graceDays: z.int(),
    })
    .nullable(),
  /** With an activation key: core's last call to erxes.io, and why it failed (null: it worked). */
  checkedAt: isoDate().nullable(),
  checkError: z.string().nullable(),
  /** The installed plugins that need a license, and what each may do now. */
  plugins: z.array(z.object({ name: z.string(), title: z.string(), access: PluginAccess })),
});

export type LicenseStatus = z.infer<typeof LicenseStatus>;

const base = oc.errors({ ...COMMON_ERRORS });

export const licenseContract = {
  status: base
    .route({
      method: 'GET',
      path: '/license',
      summary: 'Get the erxes license',
      description:
        "Self-hosted: the server's erxes license, where it comes from, and what each plugin that needs one may do",
    })
    .output(LicenseStatus),
  refresh: base
    .route({
      method: 'POST',
      path: '/license/refresh',
      summary: 'Fetch the erxes license now',
      description:
        "With an activation key, ask erxes.io for the server's license now instead of at the daily check",
    })
    .output(LicenseStatus),
};
