import { act, renderHook } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import { InMemoryCache } from '@apollo/client';
import { ReactNode } from 'react';
import { useReportActions } from '../useReports';
import { REPORT_REMOVE } from '../graphql';
import { toast } from 'erxes-ui';

const mockConfirm = jest.fn();
jest.mock('erxes-ui', () => ({
  useConfirm: () => ({ confirm: mockConfirm }),
  toast: jest.fn(),
}));
jest.mock('ui-modules', () => ({
  usePermissionCheck: () => ({ hasActionPermission: () => true }),
}));
jest.mock('@/tunable-reports/locales', () => ({
  useReportTranslation: () => ({ t: (key: string) => key }),
}));
jest.mock('react-i18next', () => ({
  getI18n: () => ({ t: (key: string) => key }),
}));
afterEach(() => jest.clearAllMocks());

test('a confirmed removal evicts filtered lists and the deleted detail immediately', async () => {
  mockConfirm.mockResolvedValue(true);
  const cache = new InMemoryCache();
  const evict = jest.spyOn(cache, 'evict');
  const wrapper = ({ children }: { children: ReactNode }) => (
    <MockedProvider
      cache={cache}
      mocks={[
        {
          request: {
            query: REPORT_REMOVE,
            variables: { _id: 'r', expectedVersion: 4 },
          },
          result: { data: { accountingTunableReportRemove: true } },
        },
      ]}
    >
      {children}
    </MockedProvider>
  );
  const { result } = renderHook(() => useReportActions(), { wrapper });
  let removed = false;
  await act(async () => {
    removed = await result.current.removeReport({ _id: 'r', version: 4 });
  });
  expect(removed).toBe(true);
  expect(evict).toHaveBeenCalledWith({ fieldName: 'accountingTunableReports' });
  expect(evict).toHaveBeenCalledWith({
    fieldName: 'accountingTunableReportDetail',
    args: { _id: 'r' },
  });
  expect(toast).toHaveBeenCalledWith(
    expect.objectContaining({ variant: 'success', description: 'deleted' }),
  );
});
test('cancelling removal leaves the cache and server untouched', async () => {
  mockConfirm.mockRejectedValue(new Error('Cancelled'));
  const cache = new InMemoryCache();
  const evict = jest.spyOn(cache, 'evict');
  const wrapper = ({ children }: { children: ReactNode }) => (
    <MockedProvider cache={cache} mocks={[]}>
      {children}
    </MockedProvider>
  );
  const { result } = renderHook(() => useReportActions(), { wrapper });
  await act(async () => {
    expect(await result.current.removeReport({ _id: 'r', version: 4 })).toBe(
      false,
    );
  });
  expect(evict).not.toHaveBeenCalled();
  expect(toast).not.toHaveBeenCalled();
});
