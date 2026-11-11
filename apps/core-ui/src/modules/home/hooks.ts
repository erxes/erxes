import { useQuery } from '@tanstack/react-query';
import { api } from '~/lib/api';

/*
 * Home reads under the same key prefixes as Contacts (`customers`,
 * `companies`) and Team members (`users`) with `list` next, so their
 * create / remove invalidations refresh these too. The `home` segment keeps
 * them apart from the paged RecordTable lists.
 */
const CUSTOMERS_KEY = ['customers'];
const COMPANIES_KEY = ['companies'];
const USERS_KEY = ['users'];

const STALE_TIME = 30_000;

const RECENT_LIMIT = 8;

const count = (page: { totalCount: number }) => page.totalCount;

export const useContactsOverview = () => {
  const customers = useQuery({
    queryKey: [...CUSTOMERS_KEY, 'list', 'home', 'count', 'customer'],
    queryFn: () => api.customers.list({ limit: 1, state: 'customer' }).then(count),
    staleTime: STALE_TIME,
  });

  const leads = useQuery({
    queryKey: [...CUSTOMERS_KEY, 'list', 'home', 'count', 'lead'],
    queryFn: () => api.customers.list({ limit: 1, state: 'lead' }).then(count),
    staleTime: STALE_TIME,
  });

  const companies = useQuery({
    queryKey: [...COMPANIES_KEY, 'list', 'home', 'count'],
    queryFn: () => api.companies.list({ limit: 1 }).then(count),
    staleTime: STALE_TIME,
  });

  const users = useQuery({
    queryKey: [...USERS_KEY, 'list', 'home', 'count'],
    queryFn: () => api.users.list({ limit: 1, status: 'active' }).then(count),
    staleTime: STALE_TIME,
  });

  return { customers, leads, companies, users };
};

export const useRecentCustomers = () =>
  useQuery({
    queryKey: [...CUSTOMERS_KEY, 'list', 'home', 'recent'],
    queryFn: () => api.customers.list({ limit: RECENT_LIMIT }).then((page) => page.data),
    staleTime: STALE_TIME,
  });

export const useRecentCompanies = () =>
  useQuery({
    queryKey: [...COMPANIES_KEY, 'list', 'home', 'recent'],
    queryFn: () => api.companies.list({ limit: RECENT_LIMIT }).then((page) => page.data),
    staleTime: STALE_TIME,
  });

export const useHomeTeamMembers = () =>
  useQuery({
    queryKey: [...USERS_KEY, 'list', 'home', 'team'],
    queryFn: () => api.users.list({ limit: 20 }),
    staleTime: STALE_TIME,
  });
