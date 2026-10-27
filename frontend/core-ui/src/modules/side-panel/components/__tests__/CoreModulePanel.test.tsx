/** @jest-environment jsdom */
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { createStore, Provider } from 'jotai';
import { useState } from 'react';
import { MemoryRouter, useSearchParams } from 'react-router-dom';
import type { PropsWithChildren } from 'react';
import { useSidePanel } from 'ui-modules';
import { CoreModulePanel } from '../CoreModulePanel';
import { SidePanelRecordStack } from '../SidePanelRecordStack';

let mockAllowed = true;
beforeEach(() => {
  mockAllowed = true;
});

jest.mock('react-router-dom', () => {
  const { TextEncoder, TextDecoder } =
    jest.requireActual<typeof import('util')>('util');
  Object.assign(global, { TextEncoder, TextDecoder });
  return jest.requireActual<typeof import('react-router-dom')>(
    'react-router-dom',
  );
});

jest.mock('erxes-ui', () => {
  const React = jest.requireActual<typeof import('react')>('react');
  const Context = React.createContext({
    open: false,
    change: (mockOpen: boolean) => void mockOpen,
  });
  const Part = ({ children, ...props }: React.ComponentProps<'div'>) => (
    <div {...props}>{children}</div>
  );
  const Sheet = ({
    open,
    onOpenChange,
    children,
  }: PropsWithChildren<{
    open: boolean;
    onOpenChange: (mockOpen: boolean) => void;
  }>) => (
    <Context.Provider value={{ open, change: onOpenChange }}>
      {children}
    </Context.Provider>
  );
  Sheet.Trigger = ({ children, onClick }: React.ComponentProps<'div'>) => {
    const context = React.useContext(Context);
    return (
      <div
        onClick={(event) => {
          onClick?.(event);
          if (!event.defaultPrevented) context.change(!context.open);
        }}
      >
        {children}
      </div>
    );
  };
  Sheet.Close = () => {
    const context = React.useContext(Context);
    return <button onClick={() => context.change(false)}>Close editor</button>;
  };
  Sheet.Header = Part;
  Sheet.Content = Part;
  Sheet.Footer = Part;
  Sheet.Title = Part;
  Sheet.Description = Part;
  Sheet.View = Part;
  return {
    Sheet,
    FocusSheet: Object.assign(Sheet, {
      SideTabs: Part,
      SideTabsList: Part,
      SideTabsTrigger: Part,
    }),
    Tabs: Object.assign(Part, { Trigger: Part }),
    Button: ({ children, ...props }: React.ComponentProps<'button'>) => (
      <button {...props}>{children}</button>
    ),
    Empty: Object.assign(Part, {
      Header: Part,
      Title: Part,
      Description: Part,
      Content: Part,
    }),
    Spinner: () => <span>Loading</span>,
    cn: (...classes: (string | undefined)[]) =>
      classes.filter(Boolean).join(' '),
    useFocusSheet: () => ({ activeSideTab: null, setActiveSideTab: jest.fn() }),
  };
});

jest.mock('ui-modules', () => {
  const React = jest.requireActual<typeof import('react')>('react');
  const { atom, useAtom, useSetAtom } =
    jest.requireActual<typeof import('jotai')>('jotai');
  const { useSearchParams } =
    jest.requireActual<typeof import('react-router-dom')>('react-router-dom');
  const historyAtom = atom<string[]>([]);
  const sessionAtom = atom(0);
  const getPath = ({
    contentType,
    contentId,
  }: {
    contentType: string;
    contentId: string;
  }) => `/detail/${contentType}/${contentId}`;
  return {
    usePermissionCheck: () => ({ hasActionPermission: () => mockAllowed }),
    RecordSidePanel: {
      Header: ({ title }: { title: string }) => <div>{title}</div>,
    },
    sidePanelHistoryState: historyAtom,
    sidePanelSessionState: sessionAtom,
    sidePanelDraftState: atom(null),
    SidePanelRecordPathContext: React.createContext(null),
    SidePanelDraftContext: React.createContext(undefined),
    parseSidePanelRecord: (path: string) => {
      const [, route, contentType, contentId] = path.split('/');
      return route === 'detail' ? { contentType, contentId } : null;
    },
    useSidePanel: () => {
      const [params, setParams] = useSearchParams();
      const path = params.get('panel');
      const [, setHistory] = useAtom(historyAtom);
      const historyJson = params.get('panelHistory') || '[]';
      const history: string[] = JSON.parse(historyJson);
      React.useEffect(() => {
        setHistory((previous) =>
          JSON.stringify(previous) === historyJson
            ? previous
            : JSON.parse(historyJson),
        );
      }, [historyJson, setHistory]);
      const setSession = useSetAtom(sessionAtom);
      const setPath = (next: string | null, nextHistory: string[] = []) =>
        setParams(
          next
            ? {
                panel: next,
                ...(nextHistory.length
                  ? { panelHistory: JSON.stringify(nextHistory) }
                  : {}),
              }
            : {},
        );
      const openPath = (next: string, options?: { stack?: boolean }) => {
        if (path === next) return;
        const nextHistory = options?.stack && path ? [...history, path] : [];
        setHistory(nextHistory);
        if (!options?.stack) setSession((previous) => previous + 1);
        setPath(next, nextHistory);
      };
      return {
        path,
        history,
        canGoBack: history.length > 0,
        openPath,
        openRecord: (
          record: { contentType: string; contentId: string },
          options?: { stack?: boolean },
        ) => openPath(getPath(record), options),
        dismissPath: (target: string) => {
          const nextHistory = history.filter((entry) => entry !== target);
          setHistory(nextHistory);
          setPath(path === target ? history.at(-1) || null : path, nextHistory);
        },
        close: () => {
          setHistory([]);
          setPath(null);
        },
        back: () => {
          setHistory(history.slice(0, -1));
          setPath(history[history.length - 1], history.slice(0, -1));
        },
      };
    },
  };
});

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (_mockKey: string, mockFallback: string) => mockFallback,
  }),
}));

const EditorBody = () => {
  const [draft, setDraft] = useState('');
  const panel = useSidePanel();
  return (
    <>
      <input
        aria-label="Editor draft"
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
      />
      <button
        onClick={() =>
          panel.openRecord(
            { contentType: 'core:customer', contentId: 'c1' },
            { stack: true },
          )
        }
      >
        Linked customer
      </button>
      <NestedEditor />
    </>
  );
};
const NestedEditor = () => {
  const [open, setOpen] = useState(false);
  return (
    <CoreModulePanel name="nested" open={open} onOpenChange={setOpen}>
      <CoreModulePanel.Trigger asChild>
        <button>Open nested editor</button>
      </CoreModulePanel.Trigger>
      <CoreModulePanel.View>
        <span>Nested editor content</span>
        <CoreModulePanel.Close />
      </CoreModulePanel.View>
    </CoreModulePanel>
  );
};
const Editor = () => {
  const [open, setOpen] = useState(false);
  return (
    <CoreModulePanel
      requiredPermission="editorManage"
      name="test-editor"
      open={open}
      onOpenChange={setOpen}
    >
      <button onClick={() => setOpen(false)}>Finish background save</button>
      <CoreModulePanel.Trigger asChild>
        <button>Open editor</button>
      </CoreModulePanel.Trigger>
      <CoreModulePanel.View>
        <CoreModulePanel.Header>
          <CoreModulePanel.Title>Test editor</CoreModulePanel.Title>
          <CoreModulePanel.Close />
        </CoreModulePanel.Header>
        <EditorBody />
        <button onClick={() => setOpen(false)}>Save and close</button>
      </CoreModulePanel.View>
    </CoreModulePanel>
  );
};
const RelatedRecord = () => {
  const panel = useSidePanel();
  return <button onClick={panel.back}>Back to editor</button>;
};
const Frame = () => {
  const panel = useSidePanel();
  const [, setParams] = useSearchParams();
  return (
    <>
      <output aria-label="Panel route">{panel.path || 'closed'}</output>
      <button onClick={() => setParams({})}>Remove panel link</button>
      {panel.path && (
        <aside>
          <SidePanelRecordStack
            path={panel.path}
            history={panel.history}
            View={RelatedRecord}
            onBack={panel.back}
            onClose={panel.close}
          />
        </aside>
      )}
    </>
  );
};
const mount = (initialEntry = '/') =>
  render(
    <Provider store={createStore()}>
      <MemoryRouter initialEntries={[initialEntry]}>
        <Editor />
        <Frame />
      </MemoryRouter>
    </Provider>,
  );

it('opens in the workspace column and can reopen after a controlled save closes it', async () => {
  mount();
  fireEvent.click(screen.getByRole('button', { name: 'Open editor' }));
  await screen.findByRole('textbox', { name: 'Editor draft' });
  expect(screen.getByLabelText('Panel route').textContent).toBe(
    '/module/test-editor',
  );
  expect(screen.queryByRole('dialog')).toBeNull();
  fireEvent.click(screen.getByRole('button', { name: 'Save and close' }));
  await waitFor(() =>
    expect(screen.getByLabelText('Panel route').textContent).toBe('closed'),
  );
  fireEvent.click(screen.getByRole('button', { name: 'Open editor' }));
  await screen.findByRole('textbox', { name: 'Editor draft' });
});

it('opens a copied URL without relying on the previous local open state', async () => {
  mount('/?panel=%2Fmodule%2Ftest-editor');
  await screen.findByRole('textbox', { name: 'Editor draft' });
  expect(
    screen.queryByText('This editor is unavailable on this page.'),
  ).toBeNull();
});

it('preserves the draft across linked-record navigation and Back', async () => {
  mount();
  fireEvent.click(screen.getByRole('button', { name: 'Open editor' }));
  const input = await screen.findByRole('textbox', { name: 'Editor draft' });
  fireEvent.change(input, { target: { value: 'Keep my changes' } });
  fireEvent.click(screen.getByRole('button', { name: 'Linked customer' }));
  await screen.findByRole('button', { name: 'Back to editor' });
  expect(screen.queryByRole('textbox', { name: 'Editor draft' })).toBeNull();
  fireEvent.click(screen.getByRole('button', { name: 'Back to editor' }));
  expect(
    (
      (await screen.findByRole('textbox', {
        name: 'Editor draft',
      })) as HTMLInputElement
    ).value,
  ).toBe('Keep my changes');
});

it('synchronizes local state when browser navigation removes the panel URL', async () => {
  mount();
  fireEvent.click(screen.getByRole('button', { name: 'Open editor' }));
  await screen.findByRole('textbox', { name: 'Editor draft' });
  fireEvent.click(screen.getByRole('button', { name: 'Remove panel link' }));
  await waitFor(() =>
    expect(screen.getByLabelText('Panel route').textContent).toBe('closed'),
  );
  fireEvent.click(screen.getByRole('button', { name: 'Open editor' }));
  await screen.findByRole('textbox', { name: 'Editor draft' });
});

it('restores nested module owners from the URL history without navigating away from the child', async () => {
  const params = new URLSearchParams({
    panel: '/module/test-editor%2Fnested',
    panelHistory: JSON.stringify(['/module/test-editor']),
  });
  mount(`/?${params}`);
  await screen.findByText('Nested editor content');
  expect(screen.getByLabelText('Panel route').textContent).toBe(
    '/module/test-editor%2Fnested',
  );
  fireEvent.click(screen.getByRole('button', { name: 'Close editor' }));
  await screen.findByRole('textbox', { name: 'Editor draft' });
});

it('removes a saved hidden editor from Back history without moving its linked record', async () => {
  mount();
  fireEvent.click(screen.getByRole('button', { name: 'Open editor' }));
  await screen.findByRole('textbox', { name: 'Editor draft' });
  fireEvent.click(screen.getByRole('button', { name: 'Linked customer' }));
  await screen.findByRole('button', { name: 'Back to editor' });
  fireEvent.click(
    screen.getByRole('button', { name: 'Finish background save' }),
  );
  await waitFor(() =>
    expect(screen.getByLabelText('Panel route').textContent).toBe(
      '/detail/core:customer/c1',
    ),
  );
  fireEvent.click(screen.getByRole('button', { name: 'Back to editor' }));
  await waitFor(() =>
    expect(screen.getByLabelText('Panel route').textContent).toBe('closed'),
  );
});

it('applies the source action permission when opening a copied editor URL', async () => {
  mockAllowed = false;
  mount('/?panel=%2Fmodule%2Ftest-editor');
  await screen.findAllByText('Access denied');
  expect(screen.queryByRole('textbox', { name: 'Editor draft' })).toBeNull();
});
