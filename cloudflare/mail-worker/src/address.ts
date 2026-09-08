const TAG_SEPARATOR = '+';

const TENANT_SEPARATOR = '--';

const DNS_LABEL = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/;

export const tenantFromAddress = (address: string) => {
  const local = (address || '').trim().toLowerCase().split('@')[0] ?? '';
  const withoutTag = local.split(TAG_SEPARATOR)[0];
  const separator = withoutTag.indexOf(TENANT_SEPARATOR);

  if (separator <= 0) {
    return undefined;
  }

  const tenant = withoutTag.slice(0, separator);

  return DNS_LABEL.test(tenant) ? tenant : undefined;
};
