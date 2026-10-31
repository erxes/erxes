import { format } from 'date-fns';
import { SettingsWorkspacePath } from '@/types/paths/SettingsPath';
import { AppPath } from '@/types/paths/AppPath';
import { ISupportGrant } from '@/settings/support-access/types';

export const SUPPORT_ACCESS_PATH = `/${AppPath.Settings}/${SettingsWorkspacePath.SupportAccess}`;

export const groupSupportGrants = (grants: ISupportGrant[]) => ({
  pending: grants.filter((grant) => grant.status === 'pending'),
  active: grants.filter((grant) => grant.status === 'approved'),
  history: grants.filter(
    (grant) => grant.status !== 'pending' && grant.status !== 'approved',
  ),
});

// When access stopped or stops: a revoke cuts the grant short
export const grantEndedAt = (grant: ISupportGrant) =>
  grant.revokedAt || grant.endsAt || undefined;

export const formatGrantEnd = (value?: string | null) =>
  value ? format(new Date(value), 'MMM d, HH:mm') : '';
