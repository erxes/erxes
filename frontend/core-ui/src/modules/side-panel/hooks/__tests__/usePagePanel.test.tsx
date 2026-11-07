/** @jest-environment jsdom */
import {
  createPagePanelPortal as createPortal,
  usePagePanel,
  PagePanelContext,
} from '@/side-panel/hooks/usePagePanel';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { createStore, Provider } from 'jotai';
import { modulePanelTargetsState } from '../../states/modulePanelState';
import { sidePanelHistoryState } from 'ui-modules';
import { AiAgentDetailSheetShell } from '@/automations/components/settings/components/agents/components/detail/AiAgentDetailSheetShell';

const mockNavigation = {
  path: null as string | null,
  canGoBack: false,
  back: jest.fn(),
  openPath: jest.fn(),
  dismissPath: jest.fn(),
};
jest.mock('ui-modules', () => ({
  SidePanelDraftContext: jest
    .requireActual<typeof import('react')>('react')
    .createContext(undefined),
  sidePanelHistoryState: jest
    .requireActual<typeof import('jotai')>('jotai')
    .atom<string[]>([]),
  SidePanelRecordPathContext: jest
    .requireActual<typeof import('react')>('react')
    .createContext(null),
  RecordSidePanel: {
    Header: ({ onClose }: { onClose: () => void }) => (
      <button onClick={onClose}>Close agent</button>
    ),
  },
  useSidePanel: () => mockNavigation,
  usePermissionCheck: () => ({
    isLoaded: true,
    hasActionPermission: () => true,
  }),
}));

const Editor = ({
  open = true,
  name = 'settings/test',
  onOpenChange = () => undefined,
}: {
  open?: boolean;
  name?: string;
  onOpenChange?: (open: boolean) => void;
}) => {
  const entry = usePagePanel({ name, open, onOpenChange });
  return (
    <PagePanelContext.Provider value={entry}>
      {entry.target &&
        createPortal(
          <>
            <input aria-label="Draft" defaultValue="Unsaved" />
            <button onClick={entry.onClose}>Close editor</button>
          </>,
          entry.target,
        )}
    </PagePanelContext.Provider>
  );
};

beforeEach(() => {
  jest.clearAllMocks();
  mockNavigation.path = null;
});

it('dismisses its own entry after navigation to another record', () => {
  const store = createStore();
  const target = document.createElement('div');
  document.body.append(target);
  store.set(modulePanelTargetsState, { '/module/settings%2Ftest': target });
  const onOpenChange = jest.fn();
  const view = render(
    <Provider store={store}>
      <Editor onOpenChange={onOpenChange} />
    </Provider>,
  );
  const field = screen.getByLabelText('Draft');
  fireEvent.change(field, { target: { value: 'Edited draft' } });
  act(() => store.set(sidePanelHistoryState, ['/module/settings%2Ftest']));
  mockNavigation.path = '/detail/customer/customer-2';
  view.rerender(
    <Provider store={store}>
      <Editor onOpenChange={onOpenChange} />
    </Provider>,
  );
  expect(screen.getByLabelText('Draft')).toBe(field);
  expect((field as HTMLInputElement).value).toBe('Edited draft');
  fireEvent.click(screen.getByRole('button', { name: 'Close editor' }));
  expect(mockNavigation.dismissPath).toHaveBeenCalledWith(
    '/module/settings%2Ftest',
  );
  expect(onOpenChange).toHaveBeenCalledWith(false);
  view.unmount();
  target.remove();
});

it('does not close a replacement entry when an earlier save completes', () => {
  const store = createStore();
  let savedClose: (() => void) | undefined;
  const onOpenChange = jest.fn();
  const Owner = ({ name }: { name: string }) => {
    const entry = usePagePanel({ name, open: true, onOpenChange });
    if (name === 'editor/a') savedClose = entry.onClose;
    return null;
  };
  const view = render(
    <Provider store={store}>
      <Owner name="editor/a" />
    </Provider>,
  );
  view.rerender(
    <Provider store={store}>
      <Owner name="editor/b" />
    </Provider>,
  );
  act(() => savedClose?.());
  expect(mockNavigation.dismissPath).toHaveBeenCalledWith('/module/editor%2Fa');
  expect(mockNavigation.dismissPath).not.toHaveBeenCalledWith(
    '/module/editor%2Fb',
  );
  expect(onOpenChange).not.toHaveBeenCalledWith(false);
});

it('recognizes a replacement record within the same legacy module route', () => {
  const store = createStore();
  let saved: ReturnType<typeof usePagePanel> | undefined;
  const onOpenChange = jest.fn();
  const Owner = ({ identity }: { identity: string }) => {
    const entry = usePagePanel({
      name: 'settings/edit',
      identity,
      open: true,
      onOpenChange,
    });
    if (identity === 'a') saved = entry;
    return null;
  };
  const view = render(
    <Provider store={store}>
      <Owner identity="a" />
    </Provider>,
  );
  view.rerender(
    <Provider store={store}>
      <Owner identity="b" />
    </Provider>,
  );
  expect(saved?.isCurrent()).toBe(false);
  act(() => saved?.onClose());
  expect(mockNavigation.dismissPath).not.toHaveBeenCalled();
  expect(onOpenChange).not.toHaveBeenCalledWith(false);
});

it('opens a URL-selected editor and releases only its own registration', () => {
  const store = createStore();
  mockNavigation.path = '/module/settings%2Ftest';
  const onOpenChange = jest.fn();
  const view = render(
    <Provider store={store}>
      <Editor open={false} onOpenChange={onOpenChange} />
    </Provider>,
  );
  expect(onOpenChange).toHaveBeenCalledWith(true);
  expect(mockNavigation.dismissPath).not.toHaveBeenCalled();
  view.unmount();
});

jest.mock('erxes-ui', () => ({
  useQueryState: () =>
    jest.requireActual<typeof import('react')>('react').useState(null),
}));

it('keeps an agent editor open until its close request is confirmed', () => {
  const store = createStore();
  const target = document.createElement('div');
  document.body.append(target);
  store.set(modulePanelTargetsState, {
    '/module/automations%2Fsettings%2Fagents%2FAiAgentDetailSheetShell': target,
  });
  const requestClose = jest.fn();
  const close = jest.fn();
  const view = render(
    <Provider store={store}>
      <AiAgentDetailSheetShell
        title="Agent"
        onRequestClose={requestClose}
        onClose={close}
      >
        {(confirmClose) => (
          <button onClick={confirmClose}>Confirm close</button>
        )}
      </AiAgentDetailSheetShell>
    </Provider>,
  );
  fireEvent.click(screen.getByRole('button', { name: 'Close agent' }));
  expect(requestClose).toHaveBeenCalledTimes(1);
  expect(mockNavigation.dismissPath).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('button', { name: 'Confirm close' }));
  expect(mockNavigation.dismissPath).toHaveBeenCalledWith(
    '/module/automations%2Fsettings%2Fagents%2FAiAgentDetailSheetShell',
  );
  expect(close).toHaveBeenCalledTimes(1);
  view.unmount();
  target.remove();
});
