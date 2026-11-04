import type { PropsWithChildren } from 'react';
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { createStore, Provider } from 'jotai';
import { useEMEditSave } from '../erxes-messenger/hooks/useEMEditSave';
import { IntegrationDraftContext } from '../hooks/useIntegrationDraft';
import {
  AddErxesMessengerPanelForm,
  AddErxesMessengerSheet,
} from '../erxes-messenger/components/AddErxesMessenger';
import { EditErxesMessengerSheet } from '../erxes-messenger/components/EditErxesMessengerSheet';
import {
  erxesMessengerSetupEditSheetOpenAtom,
  erxesMessengerSetupStepAtom,
  erxesMessengerSetupConfigAtom,
} from '../erxes-messenger/states/erxesMessengerSetupStates';

const mockDetail = jest.fn();
const mockOpenNew = jest.fn();
const mockClose = jest.fn();
const mockEdit = jest.fn();
jest.mock('../erxes-messenger/hooks/useEditMessenger', () => ({
  useEditMessenger: () => ({ editMessenger: mockEdit, loading: false }),
}));
jest.mock('../erxes-messenger/hooks/useEMIntegrationDetail', () => ({
  useEMIntegrationDetail: () => mockDetail(),
}));
jest.mock('../erxes-messenger/components/EMSetup', () => ({
  EMSetup: ({ loading }: { loading?: boolean }) => {
    const { useAtomValue } =
      jest.requireActual<typeof import('jotai')>('jotai');
    const {
      erxesMessengerSetupEditSheetOpenAtom,
      erxesMessengerSetupConfigAtom,
      erxesMessengerSetupStepAtom,
    } = jest.requireActual<
      typeof import('../erxes-messenger/states/erxesMessengerSetupStates')
    >('../erxes-messenger/states/erxesMessengerSetupStates');
    const editId = useAtomValue(erxesMessengerSetupEditSheetOpenAtom);
    const config = useAtomValue(erxesMessengerSetupConfigAtom);
    const step = useAtomValue(erxesMessengerSetupStepAtom);
    return <output>{JSON.stringify({ editId, config, step, loading })}</output>;
  },
}));
jest.mock('erxes-ui', () => ({
  isDeeplyEqual: (left: unknown, right: unknown) =>
    JSON.stringify(left) === JSON.stringify(right),
  Button: ({
    children,
    onClick,
  }: PropsWithChildren<{ onClick?: () => void }>) => (
    <button onClick={onClick}>{children}</button>
  ),
  isDefined: (value: unknown) => value != null,
}));
jest.mock('ui-modules', () => ({
  useSidePanel: () => ({ openNewRecord: mockOpenNew, close: mockClose }),
}));
jest.mock('react-router-dom', () => ({
  useParams: () => ({ id: 'channel-new' }),
}));
jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

beforeEach(() => {
  mockDetail.mockReturnValue({ loading: true });
  mockOpenNew.mockClear();
  mockClose.mockClear();
  mockEdit.mockClear();
});

it.each([true, false])(
  'Add clears the pending edit identity when detail loading is %s',
  (loading) => {
    const store = createStore();
    store.set(erxesMessengerSetupEditSheetOpenAtom, 'integration-a');
    mockDetail.mockReturnValue({ loading });
    render(
      <Provider store={store}>
        <AddErxesMessengerSheet />
      </Provider>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'add-messenger' }));
    expect(store.get(erxesMessengerSetupEditSheetOpenAtom)).toBe(false);
    expect(mockOpenNew).toHaveBeenCalledWith('frontline:integration', {
      kind: 'messenger',
      channelId: 'channel-new',
    });
  },
);

it('Add resets setup while late edit A data cannot populate the new create context', async () => {
  const store = createStore();
  const first = render(
    <Provider store={store}>
      <EditErxesMessengerSheet id="integration-a" />
    </Provider>,
  );
  first.unmount();
  store.set(erxesMessengerSetupStepAtom, 6);
  mockDetail.mockReturnValue({
    loading: false,
    integrationDetail: { _id: 'integration-a', name: 'Old A' },
  });
  render(
    <Provider store={store}>
      <AddErxesMessengerPanelForm />
    </Provider>,
  );
  await waitFor(() => expect(store.get(erxesMessengerSetupStepAtom)).toBe(1));
  expect(store.get(erxesMessengerSetupEditSheetOpenAtom)).toBe(false);
  expect(store.get(erxesMessengerSetupConfigAtom)).toBeNull();
});

it('Messenger restores abandoned edit and create drafts independently', () => {
  const store = createStore();
  const Panel = ({ id }: { id: string }) => (
    <Provider store={store}>
      <IntegrationDraftContext.Provider value={id}>
        {id === 'new' ? (
          <AddErxesMessengerPanelForm />
        ) : (
          <EditErxesMessengerSheet id={id} />
        )}
      </IntegrationDraftContext.Provider>
    </Provider>
  );
  const first = render(<Panel id="integration-a" />);
  act(() => {
    store.set(erxesMessengerSetupConfigAtom, {
      name: 'Edited A',
      brandId: 'brand-a',
      channelId: 'channel-a',
    });
    store.set(erxesMessengerSetupStepAtom, 6);
  });
  first.unmount();
  const create = render(<Panel id="new" />);
  expect(store.get(erxesMessengerSetupConfigAtom)).toBeNull();
  act(() =>
    store.set(erxesMessengerSetupConfigAtom, {
      name: 'New draft',
      brandId: 'brand-new',
      channelId: 'channel-new',
    }),
  );
  create.unmount();
  const restored = render(<Panel id="integration-a" />);
  expect(store.get(erxesMessengerSetupConfigAtom)?.name).toBe('Edited A');
  expect(store.get(erxesMessengerSetupStepAtom)).toBe(6);
  restored.unmount();
  render(<Panel id="new" />);
  expect(store.get(erxesMessengerSetupConfigAtom)?.name).toBe('New draft');
  expect(store.get(erxesMessengerSetupEditSheetOpenAtom)).toBe(false);
});
it('a stale detail result for A cannot hydrate edit B', () => {
  mockDetail.mockReturnValue({
    loading: false,
    integrationDetail: { _id: 'integration-a', name: 'Stale A' },
  });
  const store = createStore();
  render(
    <Provider store={store}>
      <EditErxesMessengerSheet id="integration-b" />
    </Provider>,
  );
  expect(store.get(erxesMessengerSetupConfigAtom)).toBeNull();
  expect(store.get(erxesMessengerSetupEditSheetOpenAtom)).toBe('integration-b');
});

it('a completed Messenger save cannot clear another open draft', () => {
  const store = createStore();
  const Save = () => {
    const { save } = useEMEditSave();
    return <button onClick={save}>Save edit</button>;
  };
  const Panel = ({ id }: { id: string }) => (
    <Provider store={store}>
      <IntegrationDraftContext.Provider value={id}>
        {id === 'new' ? (
          <AddErxesMessengerPanelForm />
        ) : (
          <EditErxesMessengerSheet id={id} />
        )}
        <Save />
      </IntegrationDraftContext.Provider>
    </Provider>
  );
  const panel = render(<Panel id="integration-a" />);
  act(() =>
    store.set(erxesMessengerSetupConfigAtom, {
      name: 'Saved A',
      brandId: 'brand',
      channelId: 'channel-a',
    }),
  );
  fireEvent.click(screen.getByRole('button', { name: 'Save edit' }));
  const complete = mockEdit.mock.calls[0][2];
  panel.rerender(<Panel id="new" />);
  act(() =>
    store.set(erxesMessengerSetupConfigAtom, {
      name: 'New draft',
      brandId: 'brand-new',
      channelId: 'channel-new',
    }),
  );
  act(() => complete());
  expect(store.get(erxesMessengerSetupConfigAtom)?.name).toBe('New draft');
  expect(mockClose).not.toHaveBeenCalled();
});
