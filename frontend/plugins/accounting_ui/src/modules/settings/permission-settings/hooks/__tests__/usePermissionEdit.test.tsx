import type { ReactNode } from 'react';
import { MockedProvider, MockedResponse } from '@apollo/client/testing';
import { act, renderHook, waitFor } from '@testing-library/react';
import { GraphQLError } from 'graphql';
import { toast } from 'erxes-ui';
import { usePermissionEdit } from '@/settings/permission-settings/hooks/usePermissionEdit';
import { SET_ACCOUNT_PERMISSIONS } from '@/settings/permission-settings/graphql/mutations/permissions';
import { IPermission } from '@/settings/permission-settings/types/Permission';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));
jest.mock('erxes-ui', () => ({ toast: jest.fn() }), { virtual: true });

const cashierOnCash: IPermission = {
  _id: 'perm-cash',
  userId: 'user-cashier',
  accountId: 'acc-101',
  level: 1,
  read: 'gtLvl',
  write: 'own',
};

const cashierOnBank: IPermission = {
  ...cashierOnCash,
  _id: 'perm-bank',
  accountId: 'acc-102',
};

const grantWrite = (
  accountIds: string[],
  result: MockedResponse['result'],
): MockedResponse => ({
  request: {
    query: SET_ACCOUNT_PERMISSIONS,
    variables: {
      accountIds,
      userId: 'user-cashier',
      level: 1,
      read: 'gtLvl',
      write: 'gtLvl',
    },
  },
  result,
});

const updated = (accountIds: string[]) => ({
  data: {
    setAccountPermissions: accountIds.map((accountId) => ({
      accountId,
      status: 'active',
    })),
  },
});

const denied = { errors: [new GraphQLError('Permission denied')] };

const renderEdit = (mocks: MockedResponse[]) =>
  renderHook(() => usePermissionEdit(), {
    wrapper: ({ children }: { children: ReactNode }) => (
      <MockedProvider mocks={mocks} addTypename={false}>
        {children}
      </MockedProvider>
    ),
  });

const toastVariants = () =>
  jest.mocked(toast).mock.calls.map(([props]) => props.variant);

beforeEach(() => {
  jest.clearAllMocks();
});

describe('usePermissionEdit', () => {
  test('a rejected permission edit shows only the error toast', async () => {
    const { result } = renderEdit([grantWrite(['acc-101'], denied)]);

    await act(async () => {
      await result.current.editPermission(cashierOnCash, { write: 'gtLvl' });
    });

    await waitFor(() => expect(toast).toHaveBeenCalled());
    expect(toastVariants()).toEqual(['destructive']);
    expect(jest.mocked(toast).mock.calls[0][0]).toMatchObject({
      description: 'Permission denied',
    });
  });

  test('a saved permission edit confirms the change once', async () => {
    const { result } = renderEdit([
      grantWrite(['acc-101'], updated(['acc-101'])),
    ]);

    await act(async () => {
      await result.current.editPermission(cashierOnCash, { write: 'gtLvl' });
    });

    await waitFor(() => expect(toast).toHaveBeenCalled());
    expect(toastVariants()).toEqual(['success']);
    expect(jest.mocked(toast).mock.calls[0][0]).toMatchObject({
      description: 'permission-updated',
    });
  });

  test('a rejected bulk edit never reports the accounts as updated', async () => {
    const { result } = renderEdit([grantWrite(['acc-101', 'acc-102'], denied)]);

    await act(async () => {
      await result.current.editPermissionsBulk([cashierOnCash, cashierOnBank], {
        write: 'gtLvl',
      });
    });

    await waitFor(() => expect(toast).toHaveBeenCalled());
    expect(toastVariants()).toEqual(['destructive']);
  });

  test('a saved bulk edit reports every updated account', async () => {
    const { result } = renderEdit([
      grantWrite(['acc-101', 'acc-102'], updated(['acc-101', 'acc-102'])),
    ]);

    await act(async () => {
      await result.current.editPermissionsBulk([cashierOnCash, cashierOnBank], {
        write: 'gtLvl',
      });
    });

    await waitFor(() => expect(toast).toHaveBeenCalled());
    expect(toastVariants()).toEqual(['success']);
    expect(jest.mocked(toast).mock.calls[0][0]).toMatchObject({
      description: 'permissions-updated',
    });
  });
});
