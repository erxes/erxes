/** @jest-environment jsdom */
import { render, screen } from '@testing-library/react';
import type { PropsWithChildren } from 'react';
import { pluginsConfigState, usePermissionCheck } from 'ui-modules';
import { createStore, Provider } from 'jotai';

import { AgentReferenceChip } from '../components/AgentReferenceChip';

jest.mock('react-router-dom', () => ({
  useNavigate: () => jest.fn(),
  useLocation: () => ({ pathname: '/contacts/customers', search: '' }),
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
) => {
  const store = createStore();
  store.set(
    pluginsConfigState,
    Object.fromEntries(remotes.map((name) => [name, {}])),
  );
  const wrapper = ({ children }: PropsWithChildren) => (
    <Provider store={store}>{children}</Provider>
  );
  return render(<AgentReferenceChip reference={ref} />, { wrapper });
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

    expect(
      screen.queryByRole('button', { name: /big order/i }),
    ).not.toBeNull();
  });
});
