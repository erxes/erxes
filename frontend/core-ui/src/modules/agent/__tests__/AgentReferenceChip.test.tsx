import { AgentReferenceScope } from '../references/AgentReferenceScope';
import { createAgentReferenceRegistry } from '../references/referenceRegistry';
import { resolveAgentReference } from '../references/resolveAgentReference';
/** @jest-environment jsdom */
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { PropsWithChildren } from 'react';
import { pluginsConfigState, usePermissionCheck } from 'ui-modules';
import { createStore, Provider } from 'jotai';

import { AgentReferenceChip } from '../components/AgentReferenceChip';

jest.mock('../references/resolveAgentReference', () => ({
  resolveAgentReference: jest.fn(async (reference) => reference),
}));

const mockNavigate = jest.fn();
let mockLocation = { pathname: '/contacts/customers', search: '' };

jest.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  useLocation: () => mockLocation,
}));

jest.mock('ui-modules', () => {
  // The real ui-modules barrel pulls every business component; the chip
  // only needs the atom + the permission hook, so stub the rest away.
  const { atom } = jest.requireActual<{ atom: (v: unknown) => unknown }>(
    'jotai',
  );
  return {
    pluginsConfigState: atom(null),
    usePermissionCheck: jest.fn(),
    SIDE_PANEL_CHAT_PATH: '/chat',
    SIDE_PANEL_QUERY_KEY: 'panel',
  };
});

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, fallback?: string) =>
      fallback ?? key.split('.').pop() ?? key,
  }),
}));

jest.mock('erxes-ui', () => {
  const Passthrough = ({ children }: PropsWithChildren) => <>{children}</>;
  return {
    Tooltip: Object.assign(Passthrough, {
      Provider: Passthrough,
      Trigger: Passthrough,
      Content: Passthrough,
    }),
    cn: (...classes: (string | false | undefined)[]) =>
      classes.filter(Boolean).join(' '),
  };
});

const hasActionPermission = jest.fn(() => false);
const hasModulePermission = jest.fn(() => false);
const mockPermissionCheck = jest.mocked(usePermissionCheck);

beforeEach(() => {
  jest.clearAllMocks();
  mockLocation = { pathname: '/contacts/customers', search: '' };
  mockPermissionCheck.mockReturnValue({
    isLoaded: true,
    hasActionPermission,
    hasModulePermission,
    isOwner: false,
    isWildcard: false,
    permissions: [],
    hasPluginPermission: () => false,
    getModuleActions: () => [],
    getModuleScope: () => 'all',
    getActionScope: () => null,
  });
});

const renderChip = (
  ref: { type: 'deal' | 'customer'; id: string; label: string },
  remotes: string[] = [],
  trusted = true,
) => {
  const store = createStore();
  store.set(
    pluginsConfigState,
    Object.fromEntries(remotes.map((name) => [name, {}])),
  );
  const wrapper = ({ children }: PropsWithChildren) => (
    <Provider store={store}>
      <AgentReferenceScope.Provider
        value={createAgentReferenceRegistry(trusted ? [ref] : [])}
      >
        {children}
      </AgentReferenceScope.Provider>
    </Provider>
  );
  return {
    ...render(<AgentReferenceChip reference={ref} />, { wrapper }),
    store,
  };
};

describe('AgentReferenceChip', () => {
  it('renders a clickable chip for a permitted core record', () => {
    hasModulePermission.mockReturnValue(true);
    renderChip({ type: 'customer', id: 'c1', label: 'Jane' });

    expect(screen.queryByRole('button', { name: /jane/i })).not.toBeNull();
  });

  it('renders a non-clickable chip when the module is not permitted', () => {
    hasModulePermission.mockReturnValue(false);
    renderChip({ type: 'customer', id: 'c1', label: 'Jane' });

    expect(screen.getByText('Jane').closest('button')).toBeNull();
    expect(screen.queryByText('Jane')).not.toBeNull();
  });

  it('renders a non-clickable chip while permissions load', () => {
    mockPermissionCheck.mockReturnValue({
      isLoaded: false,
      hasActionPermission,
      hasModulePermission,
      isOwner: false,
      isWildcard: false,
      permissions: [],
      hasPluginPermission: () => false,
      getModuleActions: () => [],
      getModuleScope: () => 'all',
      getActionScope: () => null,
    });
    hasModulePermission.mockReturnValue(true);
    renderChip({ type: 'customer', id: 'c1', label: 'Jane' });

    expect(screen.getByText('Jane').closest('button')).toBeNull();
  });

  it('renders a non-clickable chip when the target plugin UI is not loaded', () => {
    hasModulePermission.mockReturnValue(true);
    renderChip({ type: 'deal', id: 'd1', label: 'Big Order' }, []);

    expect(screen.getByText('Big Order').closest('button')).toBeNull();
  });

  it('renders a clickable chip when the plugin UI is loaded', () => {
    hasModulePermission.mockReturnValue(true);
    renderChip({ type: 'deal', id: 'd1', label: 'Big Order' }, ['sales_ui']);

    expect(screen.queryByRole('button', { name: /big order/i })).not.toBeNull();
  });

  it('keeps Assistant open when following a reference from the panel', async () => {
    hasModulePermission.mockReturnValue(true);
    mockLocation = {
      pathname: '/contacts/customers',
      search: '?panel=%2Fchat',
    };
    renderChip({ type: 'customer', id: 'c1', label: 'Jane' });
    fireEvent.click(screen.getByRole('button', { name: /jane/i }));
    await waitFor(() => expect(mockNavigate).toHaveBeenCalled());
    const destination = mockNavigate.mock.calls[0][0] as { search: string };
    expect(new URLSearchParams(destination.search).get('panel')).toBe('/chat');
  });
});

it('never turns a model-written id into a link without tool evidence', () => {
  hasModulePermission.mockReturnValue(true);
  renderChip(
    { type: 'customer', id: 'invented', label: 'Pretend customer' },
    [],
    false,
  );
  expect(screen.queryByRole('button')).toBeNull();
  expect(screen.getByText('Pretend customer')).toBeTruthy();
});
it('does not navigate when the verified record has been deleted or access revoked', async () => {
  hasModulePermission.mockReturnValue(true);
  jest
    .mocked(resolveAgentReference)
    .mockRejectedValueOnce(new Error('Unavailable'));
  renderChip({ type: 'customer', id: 'c1', label: 'Jane' });
  fireEvent.click(screen.getByRole('button', { name: /Jane/ }));
  await screen.findByText('Unavailable');
  expect(mockNavigate).not.toHaveBeenCalled();
});
it('uses current verified deal location instead of the default sales pipeline', async () => {
  hasModulePermission.mockReturnValue(true);
  jest.mocked(resolveAgentReference).mockResolvedValueOnce({
    type: 'deal',
    id: 'd1',
    label: 'Renamed deal',
    location: { boardId: 'current-board', pipelineId: 'current-pipeline' },
  });
  renderChip({ type: 'deal', id: 'd1', label: 'Old deal' }, ['sales_ui']);
  fireEvent.click(screen.getByRole('button', { name: /Old deal/ }));
  await waitFor(() =>
    expect(mockNavigate).toHaveBeenCalledWith(
      '/sales/deals?boardId=current-board&pipelineId=current-pipeline&salesItemId=d1',
    ),
  );
});
it('does not guess a pipeline when current deal metadata is incomplete', async () => {
  hasModulePermission.mockReturnValue(true);
  jest
    .mocked(resolveAgentReference)
    .mockResolvedValueOnce({ type: 'deal', id: 'd1', label: 'Deal' });
  renderChip({ type: 'deal', id: 'd1', label: 'Deal' }, ['sales_ui']);
  fireEvent.click(screen.getByRole('button', { name: /Deal/ }));
  await screen.findByText('Unavailable');
  expect(mockNavigate).not.toHaveBeenCalled();
});
it('ignores a resolution that completes after its message was removed', async () => {
  hasModulePermission.mockReturnValue(true);
  let finish:
    | ((value: Awaited<ReturnType<typeof resolveAgentReference>>) => void)
    | undefined;
  jest.mocked(resolveAgentReference).mockImplementationOnce(
    () =>
      new Promise((resolve) => {
        finish = resolve;
      }),
  );
  const { unmount } = renderChip({ type: 'customer', id: 'c1', label: 'Jane' });
  fireEvent.click(screen.getByRole('button', { name: /Jane/ }));
  unmount();
  finish?.({ type: 'customer', id: 'c1', label: 'Jane' });
  await Promise.resolve();
  expect(mockNavigate).not.toHaveBeenCalled();
});
