import { CORE_API_PREFIX } from '@erxes/core-contract';

/** Filter by area: an action prefix. */
export const AREAS = [
  { value: 'all', label: 'Everything' },
  { value: 'auth.', label: 'Sign-ins' },
  { value: 'user.', label: 'Team members' },
  { value: 'customer.', label: 'Customers' },
  { value: 'company.', label: 'Companies' },
  { value: 'tag.', label: 'Tags' },
  { value: 'field*', label: 'Properties' },
  { value: 'file.', label: 'Files' },
  { value: 'settings.', label: 'Settings' },
  { value: 'audit.', label: 'Audit log' },
] as const;

export interface Filters {
  area: string;
  actorId: string;
  source: string;
  from: string;
  to: string;
  ip: string;
  q: string;
}

export const NO_FILTERS: Filters = {
  area: 'all',
  actorId: 'all',
  source: 'all',
  from: '',
  to: '',
  ip: '',
  q: '',
};

/** `YYYY-MM-DD` (local) → the ISO instant that day starts, or the next day starts for `to`. */
const dayBoundary = (day: string, end: boolean) => {
  if (!day) return undefined;

  const date = new Date(`${day}T00:00:00`);

  if (end) date.setDate(date.getDate() + 1);

  return date.toISOString();
};

export const queryOf = (filters: Filters) => ({
  action: filters.area === 'all' ? undefined : filters.area,
  actorId: filters.actorId === 'all' ? undefined : filters.actorId,
  source: filters.source === 'all' ? undefined : filters.source,
  from: dayBoundary(filters.from, false),
  to: dayBoundary(filters.to, true),
  ip: filters.ip.trim() || undefined,
  q: filters.q.trim() || undefined,
});

/** The export endpoint with the same filters as the list. */
export const exportUrl = (filters: Filters, format: 'csv' | 'json') => {
  const params = new URLSearchParams({ format });

  for (const [key, value] of Object.entries(queryOf(filters))) if (value) params.set(key, value);

  return `${CORE_API_PREFIX}/audit/export?${params}`;
};
