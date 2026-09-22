import { z } from 'zod';
import type { CmsShare } from './model';

const tenantSchema = z.string().regex(/^[a-zA-Z0-9][a-zA-Z0-9_-]{0,127}$/);

export function requireDeliveryTenant(value: unknown): string {
  const parsed = tenantSchema.safeParse(value);
  if (!parsed.success)
    throw new Error('CMS delivery tenant is missing or invalid');
  return parsed.data;
}

export function resolveDeliveryTenant(
  savedTenant: CmsShare['subdomain'],
  databaseTenant?: string,
): string {
  const tenant = requireDeliveryTenant(
    savedTenant === undefined ? databaseTenant : savedTenant,
  );
  if (databaseTenant !== undefined && tenant !== databaseTenant)
    throw new Error('CMS delivery tenant does not match its database');
  return tenant;
}

export function assertShareTenant(share: CmsShare, subdomain: string) {
  const databaseTenant = process.env.VERSION === 'saas' ? subdomain : undefined;
  if (resolveDeliveryTenant(share.subdomain, databaseTenant) !== subdomain)
    throw new Error('CMS delivery belongs to a different tenant');
}

export function deliveryTenantFilter(subdomain: string) {
  return {
    $or: [
      { subdomain: requireDeliveryTenant(subdomain) },
      { subdomain: { $exists: false } },
    ],
  };
}
