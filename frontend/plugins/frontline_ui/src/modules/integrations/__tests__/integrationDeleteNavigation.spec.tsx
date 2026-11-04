import { act, render, renderHook, waitFor } from '@testing-library/react';
import { Provider, createStore } from 'jotai';
import type { PropsWithChildren } from 'react';
import { IntegrationRecordPanel } from '../../../widgets/record-panel/IntegrationRecordPanel';
import { useIntegrationRemove } from '../hooks/useIntegrationRemove';

const mockClose = jest.fn();
const mockBack = jest.fn();
let mockRecord = { contentType: 'frontline:integration', contentId: 'a' };
let mockCanGoBack = false;
let mockComplete: () => void;
type MutationOptions = { onCompleted?: () => void };
jest.mock('@apollo/client', () => ({
  ...jest.requireActual('@apollo/client'),
  useMutation: (_document: unknown, hookOptions: MutationOptions) => [
    (options: MutationOptions) =>
      new Promise<void>((resolve) => {
        mockComplete = () => {
          (options.onCompleted ?? hookOptions.onCompleted)?.();
          resolve();
        };
      }),
    { loading: false },
  ],
}));
jest.mock('ui-modules', () => {
  const { atom } = jest.requireActual<typeof import('jotai')>('jotai');
  return {
    currentUserState: atom({ _id: 'user' }),
    useSidePanel: () => ({
      record: mockRecord,
      canGoBack: mockCanGoBack,
      close: mockClose,
      back: mockBack,
    }),
    useSidePanelDraft: () => ({}),
    ActivityLogs: () => null,
  };
});
jest.mock('erxes-ui', () => {
  const { createProviderUi } = jest.requireActual<
    typeof import('./fixtures/providerUi')
  >('./fixtures/providerUi');
  return createProviderUi();
});
jest.mock('react-router-dom', () => ({
  useLocation: () => ({ pathname: '/' }),
  matchPath: () => null,
  useParams: () => ({}),
}));
jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));
jest.mock('../hooks/useIntegrationDetail', () => ({
  useIntegrationDetail: () => ({
    integrationDetail: { name: 'Integration' },
    loading: false,
  }),
}));
jest.mock('../components/IntegrationMoreColumn', () => ({
  IntegrationActionsMenu: () => null,
}));

beforeEach(() => {
  jest.clearAllMocks();
  mockRecord = { contentType: 'frontline:integration', contentId: 'a' };
  mockCanGoBack = false;
});

it.each([false, true])(
  'deleting A never navigates B after the menu owner unmounts (stacked=%s)',
  async (stacked) => {
    const store = createStore();
    const wrapper = ({ children }: PropsWithChildren) => (
      <Provider store={store}>{children}</Provider>
    );
    const title = render(
      <IntegrationRecordPanel {...mockRecord} view="title" />,
      { wrapper },
    );
    const remove = renderHook(
      () => useIntegrationRemove({ _id: 'a', name: 'A' }),
      { wrapper },
    );
    act(() => remove.result.current.handleRemove());
    await act(async () => {
      await Promise.resolve();
    });
    remove.unmount();
    mockRecord = { contentType: 'frontline:integration', contentId: 'b' };
    mockCanGoBack = stacked;
    title.rerender(<IntegrationRecordPanel {...mockRecord} view="title" />);
    await act(async () => mockComplete());
    expect(mockClose).not.toHaveBeenCalled();
    expect(mockBack).not.toHaveBeenCalled();
  },
);

it.each([false, true])(
  'deleting the current integration still returns from its surviving title (stacked=%s)',
  async (stacked) => {
    const store = createStore();
    mockCanGoBack = stacked;
    const wrapper = ({ children }: PropsWithChildren) => (
      <Provider store={store}>{children}</Provider>
    );
    render(<IntegrationRecordPanel {...mockRecord} view="title" />, {
      wrapper,
    });
    const remove = renderHook(
      () => useIntegrationRemove({ _id: 'a', name: 'A' }),
      { wrapper },
    );
    act(() => remove.result.current.handleRemove());
    await act(async () => {
      await Promise.resolve();
    });
    remove.unmount();
    await act(async () => mockComplete());
    await waitFor(() =>
      expect(stacked ? mockBack : mockClose).toHaveBeenCalledTimes(1),
    );
    expect(stacked ? mockClose : mockBack).not.toHaveBeenCalled();
  },
);
