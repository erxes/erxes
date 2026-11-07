/** @jest-environment jsdom */
import { render, screen, within } from '@testing-library/react';
import { type ReactNode } from 'react';
import { MemberDetail } from '../MemberDetail';

let mockExpanded = false;
let mockOwner = true;
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, fallback?: string) => fallback || key,
  }),
}));
jest.mock('jotai', () => ({
  useAtomValue: () => ({ _id: 'owner', isOwner: mockOwner }),
}));
jest.mock('@/settings/team-member/hooks/useUserDetail', () => ({
  useUserDetail: () => ({
    userDetail: {
      _id: 'member-1',
      email: 'member@example.test',
      details: { firstName: 'Team', lastName: 'Member', avatar: 'staff.png' },
    },
    loading: false,
  }),
}));
jest.mock('@/settings/team-member/hooks/useUserEdit', () => ({
  useUserCustomFieldEdit: jest.fn(),
}));
jest.mock('../MemberPanelDetail', () => ({
  MemberPanelDetail: () => null,
  MemberPanelName: ({ userId }: { userId: string }) => (
    <button>Edit name {userId}</button>
  ),
}));
jest.mock('../MemberPanelBreadcrumb', () => ({
  MemberPanelBreadcrumb: ({ title }: { title: ReactNode }) => (
    <span>{title}</span>
  ),
}));
jest.mock('../MemberPanelActions', () => ({ MemberPanelActions: () => null }));
jest.mock('../MemberActivityRows', () => ({ memberCustomActivities: [] }));
jest.mock('../MemberDetailEmptyState', () => ({
  MemberDetailEmptyState: () => null,
}));
jest.mock('../MemberDetailErrorState', () => ({
  MemberDetailErrorState: () => null,
}));
jest.mock('../MemberLinks', () => ({ MemberLinks: () => null }));
jest.mock('../MembersPermissions', () => ({ MembersPermissions: () => null }));
jest.mock('@/settings/team-member/sessions/components/MemberSessions', () => ({
  MemberSessions: () => null,
}));
jest.mock(
  '@/settings/team-member/activity/components/MemberActivityTime',
  () => ({ MemberActivityTime: () => null }),
);
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
  const Container = ({ children }: { children?: ReactNode }) => (
    <div>{children}</div>
  );
  return {
    ScrollArea: Container,
    Skeleton: () => null,
    Spinner: () => null,
    readImage: (src: string) => src,
    Avatar: Object.assign(
      ({ children }: { children: ReactNode }) => (
        <div data-testid="avatar">{children}</div>
      ),
      {
        Image: ({ src }: { src: string }) => (
          <img alt="Member avatar" src={src} />
        ),
        Fallback: Container,
      },
    ),
  };
});
jest.mock('ui-modules', () => ({
  currentUserState: null,
  ActivityLogs: () => null,
  FieldsInDetail: () => null,
  usePermissionCheck: () => ({ hasActionPermission: () => false }),
  useSidePanel: () => ({ tab: 'overview', setTab: jest.fn() }),
  usePanelExpanded: () => mockExpanded,
  RecordSidePanel: {
    Header: ({ title, avatar }: { title: ReactNode; avatar?: ReactNode }) => (
      <header>
        {avatar}
        {title}
      </header>
    ),
    Layout: ({ overviewHeader }: { overviewHeader?: ReactNode }) => (
      <>
        {mockExpanded && (
          <section data-testid="identity">{overviewHeader}</section>
        )}
      </>
    ),
  },
}));

beforeEach(() => {
  mockExpanded = false;
  mockOwner = true;
});

it('keeps the member avatar beside its editable name in a compact header', () => {
  mockExpanded = false;
  render(<MemberDetail />);
  const header = screen.getByRole('banner');
  expect(
    within(header)
      .getByRole('img', { name: 'Member avatar' })
      .getAttribute('src'),
  ).toBe('staff.png');
  expect(
    within(header).getByRole('button', { name: 'Edit name member-1' }),
  ).toBeTruthy();
});
it('keeps the avatar and editor together above the expanded overview', () => {
  mockExpanded = true;
  render(<MemberDetail />);
  const identity = screen.getByTestId('identity');
  expect(
    within(identity).getByRole('img', { name: 'Member avatar' }),
  ).toBeTruthy();
  expect(
    within(identity).getByRole('button', { name: 'Edit name member-1' }),
  ).toBeTruthy();
  expect(within(screen.getByRole('banner')).queryByRole('button')).toBeNull();
  expect(screen.getByRole('banner').textContent).toContain('Team Member');
});

it('keeps the member name read-only and retains its avatar without owner permission', () => {
  mockOwner = false;
  render(<MemberDetail />);
  const header = screen.getByRole('banner');
  expect(
    within(header).getByRole('img', { name: 'Member avatar' }),
  ).toBeTruthy();
  expect(within(header).queryByRole('button')).toBeNull();
  expect(header.textContent).toContain('Team Member');
});
