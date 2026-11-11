/** @jest-environment jsdom */
import { render, screen } from '@testing-library/react';
import type { HTMLAttributes, PropsWithChildren } from 'react';
import { DefaultLayout } from '../MainLayout';
jest.mock(
  'erxes-ui',
  () => ({
    cn: (...classes: (string | boolean)[]) => classes.filter(Boolean).join(' '),
    useQueryState: () => [false],
    Button: ({ children }: PropsWithChildren) => <>{children}</>,
    Sidebar: {
      Provider: ({
        children,
        className,
      }: PropsWithChildren<HTMLAttributes<HTMLDivElement>>) => (
        <div data-testid="layout" className={className}>
          {children}
        </div>
      ),
    },
  }),
  { virtual: true },
);
jest.mock('react-router', () => ({
  useLocation: () => ({ pathname: '/contacts' }),
  Outlet: () => null,
}));
jest.mock(
  '@/navigation/hooks/useEnterAnimation',
  () => ({
    getAppKey: () => 'contacts',
    PAGE_ENTER_KEYFRAMES: [],
    useEnterAnimation: jest.fn(),
  }),
  { virtual: true },
);
jest.mock(
  '@/app/components/CoreAppOutlet',
  () => ({
    CoreAppOutlet: () => <div data-testid="workspace" />,
  }),
  { virtual: true },
);
jest.mock(
  '@/navigation/components/core-tab/CoreTab',
  () => ({
    CoreTab: () => <div data-testid="navigation" />,
  }),
  { virtual: true },
);
jest.mock(
  '@/widgets/components/FloatingWidgets',
  () => ({ FloatingWidgets: () => null }),
  { virtual: true },
);
jest.mock(
  '@/search/components/GlobalSearch',
  () => ({ GlobalSearch: () => null }),
  { virtual: true },
);
jest.mock(
  '@/app/effect-components/WelcomeNotificationEffect',
  () => ({ WelcomeNotificationEffect: () => null }),
  { virtual: true },
);
jest.mock(
  '@/settings/support-access/components/SupportAccessBanner',
  () => ({ SupportAccessBanner: () => null }),
  { virtual: true },
);
jest.mock(
  '@/side-panel/components/SidePanelLayout',
  () => ({
    SidePanelLayout: () => <aside data-testid="relation-panel" />,
    SidePanelRecord: () => null,
  }),
  { virtual: true },
);
jest.mock(
  '@/global-sidebar/components/GlobalSidebar',
  () => ({ GlobalSidebar: () => <aside data-testid="global-sidebar" /> }),
  { virtual: true },
);
jest.mock(
  '@/app/hooks/useAppearance',
  () => ({
    useAppearanceValue: () => ({ layout: 'default', frameColor: 'indigo' }),
  }),
  { virtual: true },
);
// Only the record-view context is used; loading the whole ui-modules barrel
// would build every shared GraphQL document against the erxes-ui stub above.
jest.mock('ui-modules', () => {
  const { createContext } = jest.requireActual<typeof import('react')>('react');
  return { RecordViewContext: createContext(null) };
});
it('keeps the side panel below the top bar, beside the workspace, outside the animated page', () => {
  render(<DefaultLayout />);
  const layout = screen.getByTestId('layout');
  const navigation = screen.getByTestId('navigation');
  const column = navigation.parentElement;
  const panel = screen.getByTestId('relation-panel');
  const workspaceRow = panel.parentElement;
  expect(column?.parentElement).toBe(layout);
  // The row sits in the app card (inset in the notch layout).
  expect(workspaceRow?.parentElement?.parentElement).toBe(column);
  expect(workspaceRow?.contains(navigation)).toBe(false);
  expect(workspaceRow?.contains(screen.getByTestId('workspace'))).toBe(true);
  expect(workspaceRow?.className.split(' ')).not.toContain('flex-col');
  // The global sidebar is the right-most column, after the record panel.
  expect(panel.nextElementSibling).toBe(screen.getByTestId('global-sidebar'));
  expect(
    screen
      .getByTestId('workspace')
      .closest('main')
      ?.contains(screen.getByTestId('relation-panel')),
  ).toBe(false);
});
