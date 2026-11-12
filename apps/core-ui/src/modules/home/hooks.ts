import { useQuery } from '@tanstack/react-query';
import { orpc } from '~/lib/api';

// Home reads the same procedures as Contacts and Team members, so their
// invalidations refresh these too.

const STALE_TIME = 30_000;

const RECENT_LIMIT = 8;

const count = (page: { totalCount: number }) => page.totalCount;

export const useContactsOverview = () => {
  const customers = useQuery(
    orpc.customers.list.queryOptions({
      input: { limit: 1, state: 'customer' },
      select: count,
      staleTime: STALE_TIME,
    }),
  );

  const leads = useQuery(
    orpc.customers.list.queryOptions({
      input: { limit: 1, state: 'lead' },
      select: count,
      staleTime: STALE_TIME,
    }),
  );

  const companies = useQuery(
    orpc.companies.list.queryOptions({ input: { limit: 1 }, select: count, staleTime: STALE_TIME }),
  );

  const users = useQuery(
    orpc.users.list.queryOptions({
      input: { limit: 1, status: 'active' },
      select: count,
      staleTime: STALE_TIME,
    }),
  );

  return { customers, leads, companies, users };
};

export const useRecentCustomers = () =>
  useQuery(
    orpc.customers.list.queryOptions({
      input: { limit: RECENT_LIMIT },
      select: (page) => page.data,
      staleTime: STALE_TIME,
    }),
  );

export const useRecentCompanies = () =>
  useQuery(
    orpc.companies.list.queryOptions({
      input: { limit: RECENT_LIMIT },
      select: (page) => page.data,
      staleTime: STALE_TIME,
    }),
  );

export const useHomeTeamMembers = () =>
  useQuery(orpc.users.list.queryOptions({ input: { limit: 20 }, staleTime: STALE_TIME }));
