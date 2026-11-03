import { renderHook } from '@testing-library/react';
import { useMultiQueryState } from 'erxes-ui';
import { useSafeRemainderVariables } from '@/inventories/safeRemainders/hooks/useSafeRemainders';

jest.mock('@apollo/client', () => ({ useQuery: jest.fn() }));
jest.mock('@/utils/graphql', () => ({ toGraphqlView: jest.fn() }));
jest.mock('../../graphql/safeRemainderQueries', () => ({
  SAFE_REMAINDERS_QUERY: {},
}));
jest.mock('erxes-ui', () => ({
  parseDateRangeFromString: jest.fn(),
  useMultiQueryState: jest.fn(),
}));

const variablesFor = (queryParams: Record<string, unknown>) => {
  jest.mocked(useMultiQueryState).mockReturnValue([queryParams, jest.fn()]);
  return renderHook(() => useSafeRemainderVariables()).result.current;
};

test('selected statuses are sent with the other list filters', () => {
  expect(
    variablesFor({ statuses: ['draft', 'published'], branchId: 'ub' }),
  ).toEqual({ statuses: ['draft', 'published'], branchId: 'ub' });
});

test.each([[null], [[]]])(
  'no status is sent when the filter is %j',
  (statuses) => {
    expect(variablesFor({ statuses })).toEqual({});
  },
);
