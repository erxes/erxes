/** @jest-environment jsdom */
import { MockedProvider } from '@apollo/client/testing';
import { useQuery } from '@apollo/client';
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { CPUserPanelActions } from '../CPUserPanelActions';
import { GET_CLIENT_PORTAL_USERS } from '../../../graphql/getClientPortalUsers';
import { CP_USERS_REMOVE } from '../../../graphql/cpUsersRemove';

const mockBack = jest.fn();
const mockClose = jest.fn();
let mockPanel = {
  back: mockBack,
  close: mockClose,
  canGoBack: true,
  dismissPath: jest.fn(),
  record: { contentType: 'core:cpUser', contentId: 'cp-1' },
};

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, fallback?: string) => fallback || key,
  }),
}));
jest.mock('erxes-ui', () => {
  const Container = ({ children }: React.PropsWithChildren) => (
    <div>{children}</div>
  );
  return {
    GQL_PAGE_INFO: 'totalCount',
    Button: Container,
    Popover: Object.assign(Container, {
      Trigger: Container,
      Content: Container,
    }),
    Command: Object.assign(Container, {
      List: Container,
      Group: Container,
      Separator: () => null,
      Item: ({
        children,
        onSelect,
      }: React.PropsWithChildren<{ onSelect: () => void }>) => (
        <button onClick={onSelect}>{children}</button>
      ),
    }),
    toast: jest.fn(),
    useConfirm: () => ({ confirm: () => Promise.resolve() }),
  };
});
jest.mock('ui-modules', () => ({
  Can: ({ children }: React.PropsWithChildren) => <>{children}</>,
  useSidePanel: () => mockPanel,
  getSidePanelRecordPath: ({
    contentType,
    contentId,
  }: {
    contentType: string;
    contentId: string;
  }) => `/detail/${contentType}/${contentId}`,
}));
jest.mock('../CPUserSetPasswordDialog', () => ({
  CPUserSetPasswordDialog: () => null,
}));

const user = {
  _id: 'cp-1',
  clientPortalId: 'portal-1',
  type: 'customer',
  email: 'alice@example.com',
  phone: null,
  username: null,
  firstName: 'Alice',
  lastName: null,
  companyName: null,
  companyRegistrationNumber: null,
  erxesCustomerId: null,
  clientPortal: null,
  isVerified: false,
  isPhoneVerified: false,
  isEmailVerified: false,
  fcmTokens: [],
  lastLoginAt: null,
  createdAt: null,
  updatedAt: null,
};
const filter = { clientPortalId: 'portal-1', limit: 20 };

const Harness = () => {
  const { data } = useQuery(GET_CLIENT_PORTAL_USERS, { variables: { filter } });
  return (
    <>
      <p>Users: {data?.getClientPortalUsers.list.length ?? 'loading'}</p>
      <CPUserPanelActions
        user={{
          _id: user._id,
          clientPortalId: user.clientPortalId,
          isVerified: false,
          isPhoneVerified: false,
          isEmailVerified: false,
        }}
      />
    </>
  );
};

it('refreshes the active filtered list and dismisses only the deleted route after navigation changes', async () => {
  const previousDismiss = mockPanel.dismissPath;
  const wrapper = ({ children }: React.PropsWithChildren) => (
    <MockedProvider
      addTypename={false}
      mocks={[
        {
          request: { query: GET_CLIENT_PORTAL_USERS, variables: { filter } },
          result: {
            data: { getClientPortalUsers: { list: [user], totalCount: 1 } },
          },
        },
        {
          request: { query: CP_USERS_REMOVE, variables: { ids: [user._id] } },
          delay: 30,
          result: { data: { cpUsersRemove: 'success' } },
        },
        {
          request: { query: GET_CLIENT_PORTAL_USERS, variables: { filter } },
          result: {
            data: { getClientPortalUsers: { list: [], totalCount: 0 } },
          },
        },
      ]}
    >
      {children}
    </MockedProvider>
  );
  const view = render(<Harness />, { wrapper });
  await screen.findByText('Users: 1');
  await act(async () => {
    fireEvent.click(screen.getByRole('button', { name: 'Delete' }));
  });
  mockPanel = { ...mockPanel, dismissPath: jest.fn() };
  view.rerender(<Harness />);
  await waitFor(() => expect(screen.getByText('Users: 0')).toBeTruthy());
  await waitFor(() =>
    expect(mockPanel.dismissPath).toHaveBeenCalledWith(
      '/detail/core:cpUser/cp-1',
    ),
  );
  expect(previousDismiss).not.toHaveBeenCalled();
  expect(mockBack).not.toHaveBeenCalled();
  expect(mockClose).not.toHaveBeenCalled();
});

it('does not navigate away from a new page when deletion finishes after unmount', async () => {
  mockPanel.dismissPath.mockClear();
  const onDeleted = jest.fn();
  const Page = ({ showUser }: { showUser: boolean }) => {
    const { loading } = useQuery(GET_CLIENT_PORTAL_USERS, {
      variables: { filter },
    });
    if (loading) return <p>Loading</p>;
    return showUser ? (
      <CPUserPanelActions
        user={{
          _id: user._id,
          clientPortalId: user.clientPortalId,
          isVerified: false,
          isPhoneVerified: false,
          isEmailVerified: false,
        }}
        onDeleted={onDeleted}
      />
    ) : (
      <p>Another page</p>
    );
  };
  const wrapper = ({ children }: React.PropsWithChildren) => (
    <MockedProvider
      addTypename={false}
      mocks={[
        {
          request: { query: GET_CLIENT_PORTAL_USERS, variables: { filter } },
          result: {
            data: { getClientPortalUsers: { list: [user], totalCount: 1 } },
          },
        },
        {
          request: { query: CP_USERS_REMOVE, variables: { ids: [user._id] } },
          delay: 30,
          result: { data: { cpUsersRemove: 'success' } },
        },
        {
          request: { query: GET_CLIENT_PORTAL_USERS, variables: { filter } },
          result: {
            data: { getClientPortalUsers: { list: [], totalCount: 0 } },
          },
        },
      ]}
    >
      {children}
    </MockedProvider>
  );
  const view = render(<Page showUser />, { wrapper });
  await screen.findByRole('button', { name: 'Delete' });
  await act(async () =>
    fireEvent.click(screen.getByRole('button', { name: 'Delete' })),
  );
  view.rerender(<Page showUser={false} />);
  await waitFor(() => expect(mockPanel.dismissPath).toHaveBeenCalled());
  expect(onDeleted).not.toHaveBeenCalled();
  expect(screen.getByText('Another page')).toBeTruthy();
});
