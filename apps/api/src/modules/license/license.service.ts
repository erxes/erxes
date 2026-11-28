import type { LicenseStatus } from '@erxes/core-contract';
import { db, pluginInstallations, plugins, requestOrgId, withOrg } from '@erxes/core-db';
import type { z } from 'zod';
import { and, eq, sql } from 'drizzle-orm';
import { config } from '~/config';
import { fetchLicense } from './activation';
import { currentLicense, GRACE_DAYS, licenseAccess, licenseSource, storedLicense } from './license';

/** The plugins installed in this organisation that need a license, and what each may do now. */
const licensedPlugins = async () => {
  const rows = await db()
    .select({ name: plugins.name, manifest: plugins.manifest })
    .from(plugins)
    .innerJoin(pluginInstallations, eq(pluginInstallations.plugin, plugins.name))
    .where(
      and(
        eq(plugins.status, 'active'),
        eq(pluginInstallations.status, 'active'),
        sql`(${plugins.manifest} ->> 'requiresLicense')::boolean`,
      ),
    )
    .orderBy(plugins.name);

  return Promise.all(
    rows.map(async ({ name, manifest }) => ({
      name,
      title: manifest?.title ?? name,
      access: await licenseAccess(name, manifest),
    })),
  );
};

/** Self-hosted: the server's erxes license, where it comes from, and what it lets plugins do. */
export const licenseStatus = async (): Promise<z.input<typeof LicenseStatus>> => {
  if (config.saas.enabled) {
    return {
      saas: true,
      source: null,
      license: null,
      checkedAt: null,
      checkError: null,
      plugins: [],
    };
  }

  const source = licenseSource();

  const [license, stored, licensed] = await Promise.all([
    currentLicense(),
    source === 'activation' ? storedLicense() : null,
    licensedPlugins(),
  ]);

  return {
    saas: false,
    source,
    license: license && {
      customer: license.customer,
      plugins: license.plugins,
      until: license.until,
      graceDays: GRACE_DAYS,
    },
    checkedAt: stored?.checkedAt ?? null,
    checkError: stored?.checkError ?? null,
    plugins: licensed,
  };
};

/** With an activation key, fetches the license from erxes.io now, then says where it stands. */
export const refreshLicense = async () => {
  if (licenseSource() === 'activation') await fetchLicense();

  return withOrg(requestOrgId(), () => licenseStatus());
};
