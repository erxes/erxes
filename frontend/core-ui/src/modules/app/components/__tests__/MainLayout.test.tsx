/** @jest-environment jsdom */
import { render, screen } from '@testing-library/react';
import type { HTMLAttributes, PropsWithChildren } from 'react';
import { DefaultLayout } from '../MainLayout';
jest.mock(
  'erxes-ui',
  () => ({
    cn: (...classes: (string | boolean)[]) => classes.filter(Boolean).join(' '),
    useQueryState: () => [false],
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
  '@/side-panel/components/SidePanelLayout',
  () => ({
    SidePanelLayout: () => <aside data-testid="relation-panel" />,
  }),
  { virtual: true },
);
it('keeps the side panel beside the navigation/workspace column, outside the animated page', () => {
  render(<DefaultLayout />);
  const layout = screen.getByTestId('layout');
  const column = screen.getByTestId('navigation').parentElement;
  expect(column?.parentElement).toBe(layout);
  expect(column?.contains(screen.getByTestId('workspace'))).toBe(true);
  expect(screen.getByTestId('relation-panel').parentElement).toBe(layout);
  expect(layout.className.split(' ')).not.toContain('flex-col');
  expect(
    screen
      .getByTestId('workspace')
      .closest('main')
      ?.contains(screen.getByTestId('relation-panel')),
  ).toBe(false);
});
