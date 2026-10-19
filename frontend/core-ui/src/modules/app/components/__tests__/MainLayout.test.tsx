/** @jest-environment jsdom */
import { render, screen } from '@testing-library/react';
import { createStore, Provider } from 'jotai';
import type { HTMLAttributes, PropsWithChildren } from 'react';
import { DefaultLayout } from '../MainLayout';
import {
  agentSidePanelOpenState,
  agentSidePanelResizingState,
} from '@/agent/states/agentPanelStates';

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
jest.mock('react-hotkeys-hook', () => ({ useHotkeys: jest.fn() }));
jest.mock(
  'ui-modules',
  () => ({
    usePermissionCheck: () => ({
      isLoaded: true,
      hasActionPermission: () => true,
    }),
  }),
  { virtual: true },
);
jest.mock(
  '@/agent/states/agentPanelStates',
  () => {
    const { atom } = jest.requireActual<typeof import('jotai')>('jotai');
    return {
      agentSidePanelOpenState: atom(false),
      agentSidePanelResizingState: atom(false),
    };
  },
  { virtual: true },
);
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
jest.mock(
  '@/agent/components/AgentSidePanel',
  () => ({
    AgentSidePanel: () => <aside data-testid="agent-panel" />,
  }),
  { virtual: true },
);
jest.mock(
  '@/agent/components/AgentTray',
  () => ({
    AgentTray: () => <button data-testid="agent-tray">Open agent</button>,
  }),
  { virtual: true },
);

it('keeps the full-height relation panel beside the navigation/workspace column and retains the agent tray', async () => {
  render(<DefaultLayout />);
  const layout = screen.getByTestId('layout');
  const column = screen.getByTestId('navigation').parentElement;
  expect(column?.parentElement).toBe(layout);
  expect(column?.contains(screen.getByTestId('workspace'))).toBe(true);
  expect(screen.getByTestId('relation-panel').parentElement).toBe(layout);
  expect(layout.className.split(' ')).not.toContain('flex-col');
  expect(await screen.findByTestId('agent-tray')).toBeTruthy();
});

it('shows agent chat inside the workspace while keeping the relation panel mounted', async () => {
  const store = createStore();
  store.set(agentSidePanelOpenState, true);
  store.set(agentSidePanelResizingState, true);
  render(
    <Provider store={store}>
      <DefaultLayout />
    </Provider>,
  );
  const agent = await screen.findByTestId('agent-panel');
  expect(agent.closest('main')).toBeTruthy();
  expect(screen.getByTestId('relation-panel')).toBeTruthy();
  expect(screen.queryByTestId('agent-tray')).toBeNull();
  expect(screen.getByTestId('layout').className).toContain('cursor-col-resize');
});
