import { getEnv } from '../../utils/utils';

// The key extension installs, subscriptions and permissions are stored under.
// SaaS has one workspace per subdomain. A self-hosted erxes is one workspace
// whatever hostname reaches it (localhost, a LAN name, a tailnet name), so
// every hostname maps to the same key there.
export const extensionTenant = (subdomain: string) =>
  getEnv({ name: 'VERSION', defaultValue: 'os' }) === 'saas' ? subdomain : 'os';
