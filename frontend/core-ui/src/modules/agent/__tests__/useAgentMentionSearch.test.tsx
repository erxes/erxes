/** @jest-environment jsdom */
import { MockedProvider } from '@apollo/client/testing';
import { renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';

import { AGENTS_MENTION_COMPANIES } from '../graphql/mentions';
import { useAgentMentionSearch } from '../hooks/useAgentMentionSearch';

const mockProviders = { providers: [] as unknown[] };

jest.mock('ui-modules', () => ({
  usePermissionCheck: () => ({
    isLoaded: true,
    hasModulePermission: () => true,
  }),
  useUsers: () => ({
    users: [
      { _id: 'u1', email: 'ann@example.com', details: { fullName: 'Ann Lee' } },
    ],
    loading: false,
  }),
  useCustomers: () => ({ customers: [], loading: false }),
}));
jest.mock('@/search/hooks/useSearchProviders', () => ({
  useSearchProviders: () => mockProviders,
}));

const wrapper = ({ children }: { children: ReactNode }) => (
  <MockedProvider
    mocks={[
      {
        request: {
          query: AGENTS_MENTION_COMPANIES,
          variables: { searchValue: 'an', limit: 5 },
        },
        result: { data: { companies: { list: [] } } },
      },
    ]}
  >
    {children}
  </MockedProvider>
);

// Sales and frontline disabled, their permissions missing or still loading:
// no plugin provider remains, and an empty GlobalSearch document cannot parse.
it.each(['', 'an'])('searches without plugin providers for "@%s"', (query) => {
  const { result } = renderHook(() => useAgentMentionSearch(query), {
    wrapper,
  });

  expect(result.current.groups).toEqual([
    {
      type: 'user',
      options: [
        {
          mention: { type: 'user', id: 'u1', label: 'Ann Lee' },
          description: 'ann@example.com',
          avatar: undefined,
        },
      ],
    },
  ]);
});
