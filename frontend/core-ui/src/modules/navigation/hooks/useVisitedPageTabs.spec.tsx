import { useVisitedPageTabs } from '@/navigation/hooks/useVisitedPageTabs';
import { Provider } from 'jotai';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useState } from 'react';
import {
  MemoryRouter,
  Navigate,
  Outlet,
  Route,
  Routes,
  useNavigate,
} from 'react-router-dom';

const TabsLifecycleProbe = () => {
  const {
    activePathname,
    closeVisitedPageTab,
    tabs,
  } = useVisitedPageTabs();
  const navigate = useNavigate();

  return (
    <>
      <output data-testid="active-pathname">{activePathname}</output>
      <output data-testid="tab-pathnames">
        {JSON.stringify(tabs.map((tab) => tab.pathname))}
      </output>
      <button type="button" onClick={() => navigate('/sales/deals')}>
        Open sales
      </button>
      <button
        type="button"
        onClick={() => navigate('/sales/deals/deal-1')}
      >
        Open deal
      </button>
      <button
        type="button"
        onClick={() => closeVisitedPageTab(activePathname)}
      >
        Close active
      </button>
      <button type="button" onClick={() => navigate(-1)}>
        Back
      </button>
      <Outlet />
    </>
  );
};

const TabsLifecycleHost = () => {
  const [shellVisible, setShellVisible] = useState(true);

  return (
    <>
      <button
        type="button"
        onClick={() => setShellVisible((visible) => !visible)}
      >
        Toggle tab shell
      </button>
      {shellVisible && <TabsLifecycleProbe />}
    </>
  );
};

const renderTabsLifecycle = (initialPathname: string) =>
  render(
    <Provider>
      <MemoryRouter initialEntries={[initialPathname]}>
        <Routes>
          <Route element={<TabsLifecycleHost />}>
            <Route
              path="/operation"
              element={<Navigate to="/operation/tasks" replace />}
            />
            <Route path="*" element={<div />} />
          </Route>
        </Routes>
      </MemoryRouter>
    </Provider>,
  );

const expectTabPathnames = async (pathnames: string[]) => {
  await waitFor(() =>
    expect(screen.getByTestId('tab-pathnames').textContent).toBe(
      JSON.stringify(pathnames),
    ),
  );
};

describe('useVisitedPageTabs', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('creates tabs as new plugin pages and nested pages are entered', async () => {
    renderTabsLifecycle('/my-inbox');

    await expectTabPathnames(['/my-inbox']);

    fireEvent.click(screen.getByRole('button', { name: 'Open sales' }));
    await expectTabPathnames(['/my-inbox', '/sales/deals']);

    fireEvent.click(screen.getByRole('button', { name: 'Open deal' }));
    await expectTabPathnames([
      '/my-inbox',
      '/sales/deals',
      '/sales/deals/deal-1',
    ]);
  });

  it('replaces a plugin redirect path instead of creating a ghost tab', async () => {
    renderTabsLifecycle('/operation');

    await expectTabPathnames(['/operation/tasks']);
    expect(screen.getByTestId('active-pathname').textContent).toBe(
      '/operation/tasks',
    );
  });

  it('restores open tabs after the tab shell remounts', async () => {
    renderTabsLifecycle('/my-inbox');

    await expectTabPathnames(['/my-inbox']);
    fireEvent.click(screen.getByRole('button', { name: 'Open sales' }));
    await expectTabPathnames(['/my-inbox', '/sales/deals']);

    fireEvent.click(screen.getByRole('button', { name: 'Toggle tab shell' }));
    expect(screen.queryByTestId('tab-pathnames')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Toggle tab shell' }));

    await expectTabPathnames(['/my-inbox', '/sales/deals']);
    expect(
      window.localStorage.getItem('navigation:visited-page-tabs'),
    ).toBe(
      JSON.stringify([
        { pathname: '/my-inbox' },
        { pathname: '/sales/deals' },
      ]),
    );
  });

  it('does not reopen a closed active page when navigating back', async () => {
    renderTabsLifecycle('/my-inbox');

    await expectTabPathnames(['/my-inbox']);
    fireEvent.click(screen.getByRole('button', { name: 'Open sales' }));
    await expectTabPathnames(['/my-inbox', '/sales/deals']);

    fireEvent.click(screen.getByRole('button', { name: 'Close active' }));
    await expectTabPathnames(['/my-inbox']);

    fireEvent.click(screen.getByRole('button', { name: 'Back' }));
    await expectTabPathnames(['/my-inbox']);
    expect(screen.getByTestId('active-pathname').textContent).toBe(
      '/my-inbox',
    );
  });
});
