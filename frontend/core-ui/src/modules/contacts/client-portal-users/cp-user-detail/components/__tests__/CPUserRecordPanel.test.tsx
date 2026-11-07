/** @jest-environment jsdom */
import { fireEvent, render, screen, within } from '@testing-library/react';
import { type ReactNode } from 'react';
import { type ICPUser } from '../../../types/cpUser';
import { CPUserRecordPanel } from '../CPUserRecordPanel';

let mockExpanded = false;
let mockCanManage = true;
const mockEdit = jest.fn();
let mockUser: ICPUser;
const record = { contentType: 'core:cpUser' as const, contentId: 'cp-1' };
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, fallback?: string | { defaultValue?: string }) =>
      typeof fallback === 'string' ? fallback : fallback?.defaultValue || key,
  }),
}));
jest.mock('@/contacts/client-portal-users/hooks/useClientPortalUser', () => ({
  useClientPortalUser: () => ({ cpUser: mockUser, loading: false }),
}));
jest.mock('@/contacts/client-portal-users/hooks/useCPUserEdit', () => ({
  useCPUserEdit: () => ({ cpUserEdit: mockEdit }),
}));
jest.mock('../CPUserPanelActions', () => ({ CPUserPanelActions: () => null }));
jest.mock('../CPUserDetailFields', () => ({
  CPUserDetailFields: () => <div>Details</div>,
}));
jest.mock('../CPUserDetailNotifications', () => ({
  CPUserDetailNotifications: () => null,
}));
jest.mock('@/contacts/client-portal-users/components/AddCPUserForm', () => ({
  AddCPUserForm: () => null,
}));
jest.mock('@/side-panel/components/details/ContactPanelBreadcrumb', () => ({
  ContactPanelBreadcrumb: ({ title }: { title: ReactNode }) => (
    <span>{title}</span>
  ),
}));
jest.mock('@/side-panel/components/details/ContactPanelActions', () => ({
  ContactPanelIdentity: ({
    title,
    avatar,
  }: {
    title: ReactNode;
    avatar?: ReactNode;
  }) => (
    <>
      {avatar}
      {title}
    </>
  ),
}));
jest.mock('erxes-ui', () => {
  const React = jest.requireActual<typeof import('react')>('react');
  const Container = ({ children }: { children?: ReactNode }) => (
    <div>{children}</div>
  );
  return {
    Button: Container,
    Empty: Object.assign(Container, {
      Header: Container,
      Title: Container,
      Description: Container,
      Content: Container,
    }),
    ScrollArea: Container,
    Spinner: () => null,
    Badge: ({ children }: { children: ReactNode }) => <span>{children}</span>,
    readImage: (src: string) => src,
    Avatar: Object.assign(
      ({ children }: { children: ReactNode }) => (
        <div data-testid="avatar">{children}</div>
      ),
      { Image: () => null, Fallback: Container },
    ),
    FullNameValue: () => <span>Editable name</span>,
    FullNameField: ({
      children,
      firstName = '',
      lastName = '',
      onValueChange,
    }: {
      children: ReactNode;
      firstName?: string;
      lastName?: string;
      onValueChange: (first: string, last: string) => void;
    }) => {
      const [first, setFirst] = React.useState(firstName);
      const [last, setLast] = React.useState(lastName);
      React.useEffect(() => {
        setFirst(firstName);
        setLast(lastName);
      }, [firstName, lastName]);
      return (
        <>
          {children}
          <input
            aria-label="First name"
            value={first}
            onChange={(e) => setFirst(e.target.value)}
          />
          <input
            aria-label="Last name"
            value={last}
            onChange={(e) => setLast(e.target.value)}
          />
          <button onClick={() => onValueChange(first, last)}>Save name</button>
        </>
      );
    },
  };
});
jest.mock('ui-modules', () => ({
  NEW_RECORD_ID: 'new',
  ActivityLogs: () => null,
  usePermissionCheck: () => ({ hasActionPermission: () => mockCanManage }),
  usePanelExpanded: () => mockExpanded,
  useSidePanel: () => ({ tab: 'overview', setTab: jest.fn() }),
  PanelFieldTrigger: ({ children }: { children: ReactNode }) => (
    <span>{children}</span>
  ),
  RecordSidePanel: {
    Header: ({ title }: { title: ReactNode }) => <header>{title}</header>,
    Layout: ({
      header,
      profile,
      overviewHeader,
      tabs,
    }: {
      header: ReactNode;
      profile?: ReactNode;
      overviewHeader?: ReactNode;
      tabs: { content: ReactNode }[];
    }) => (
      <>
        {header}
        {profile}
        <nav data-testid="tabs">Tabs</nav>
        {mockExpanded && (
          <section data-testid="identity">{overviewHeader}</section>
        )}
        {tabs[0].content}
      </>
    ),
  },
}));

beforeEach(() => {
  mockEdit.mockClear();
  mockExpanded = false;
  mockCanManage = true;
  mockUser = {
    _id: 'cp-1',
    firstName: 'Ariunaa',
    lastName: 'Inbox QA 01',
    email: 'ariunaa@example.test',
    clientPortalId: 'portal-1',
    isVerified: true,
    isEmailVerified: false,
    isPhoneVerified: false,
  };
});
const panel = () => (
  <CPUserRecordPanel
    record={{ ...record, contentId: mockUser._id }}
    onClose={() => undefined}
  />
);

it('edits the two header names without an avatar and saves the selected user', () => {
  render(panel());
  const header = screen.getByRole('banner');
  fireEvent.change(within(header).getByLabelText('First name'), {
    target: { value: 'Changed' },
  });
  fireEvent.change(within(header).getByLabelText('Last name'), {
    target: { value: 'Surname' },
  });
  fireEvent.click(within(header).getByRole('button', { name: 'Save name' }));
  expect(mockEdit).toHaveBeenCalledWith({
    variables: { _id: 'cp-1', firstName: 'Changed', lastName: 'Surname' },
  });
  expect(screen.queryByTestId('avatar')).toBeNull();
  expect(
    screen
      .getByTestId('tabs')
      .compareDocumentPosition(screen.getByText('Verified')) &
      Node.DOCUMENT_POSITION_FOLLOWING,
  ).toBeTruthy();
});
it('keeps read-only names visible without an editor', () => {
  mockCanManage = false;
  render(panel());
  expect(screen.getByRole('banner').textContent).toContain(
    'Ariunaa Inbox QA 01',
  );
  expect(screen.queryByRole('textbox')).toBeNull();
});
it('places the editor in the expanded overview row and resets drafts for another user', () => {
  mockExpanded = true;
  const view = render(panel());
  const heading = screen.getByTestId('identity');
  fireEvent.change(within(heading).getByLabelText('First name'), {
    target: { value: 'Unsaved' },
  });
  mockUser = { ...mockUser, _id: 'cp-2' };
  view.rerender(panel());
  expect(screen.getByLabelText<HTMLInputElement>('First name').value).toBe(
    'Ariunaa',
  );
  fireEvent.click(screen.getByRole('button', { name: 'Save name' }));
  expect(mockEdit).not.toHaveBeenCalled();
});
