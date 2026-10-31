/** @jest-environment jsdom */
import { fireEvent, render, screen } from '@testing-library/react';
import { createStore, Provider, useAtomValue, useSetAtom } from 'jotai';
import { useLayoutEffect } from 'react';
import type { PropsWithChildren } from 'react';
import {
  modulePanelEntriesState,
  modulePanelTargetsState,
} from '@/side-panel/states/modulePanelState';
import { ProductChooserSheet } from '../ProductChooserSheet';

let mockPath: string | null = null;
const mockListeners = new Set<() => void>();
const mockOpenPath = (path: string | null) => {
  mockPath = path;
  mockListeners.forEach((listener) => listener());
};
jest.mock('ui-modules', () => {
  const { atom } = jest.requireActual<typeof import('jotai')>('jotai');
  const { createContext, useSyncExternalStore } =
    jest.requireActual<typeof import('react')>('react');
  return {
    SidePanelDraftContext: createContext(undefined),
    sidePanelHistoryState: atom<string[]>([]),
    usePermissionCheck: () => ({ hasActionPermission: () => true }),
    useSidePanel: () => ({
      path: useSyncExternalStore(
        (listener) => {
          mockListeners.add(listener);
          return () => mockListeners.delete(listener);
        },
        () => mockPath,
      ),
      openPath: mockOpenPath,
      dismissPath: () => mockOpenPath(null),
    }),
    RecordSidePanel: { Header: () => null },
  };
});
jest.mock('erxes-ui', () => {
  const { cloneElement } = jest.requireActual<typeof import('react')>('react');
  const Container = ({ children }: PropsWithChildren) => <div>{children}</div>;
  const Sheet = Object.assign(Container, {
    Trigger: ({
      children,
      onClick,
    }: {
      children: React.ReactElement<{ onClick?: React.MouseEventHandler }>;
      onClick: React.MouseEventHandler;
    }) => cloneElement(children, { onClick }),
    View: Container,
    Header: Container,
    Title: Container,
    Description: Container,
    Close: Container,
    Content: Container,
    Footer: Container,
  });
  return {
    Sheet,
    GQL_CURSOR_PARAM_DEFS: '',
    GQL_CURSOR_PARAMS: '',
    GQL_PAGE_INFO: '',
    FocusSheet: Sheet,
    Button: ({ children, ...props }: React.ComponentProps<'button'>) => (
      <button {...props}>{children}</button>
    ),
    Input: (props: React.ComponentProps<'input'>) => <input {...props} />,
    Badge: Container,
    Empty: Container,
    Spinner: () => null,
    cn: (...classes: (string | false | undefined)[]) =>
      classes.filter(Boolean).join(' '),
  };
});
jest.mock('@apollo/client', () => ({
  ...jest.requireActual<typeof import('@apollo/client')>('@apollo/client'),
  useQuery: () => ({
    data: {
      productsMain: {
        list: [{ _id: 'product', code: 'SKU', name: 'Existing product' }],
        totalCount: 1,
      },
    },
    loading: false,
  }),
}));
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (_key: string, fallback: unknown) =>
      typeof fallback === 'string' ? fallback : '',
  }),
}));
jest.mock('react-intersection-observer', () => ({ useInView: () => ({}) }));

// Use the real panel registry and portal: editors sharing a route all render
// into the same target, even if only one local trigger was clicked.
const PanelTarget = () => {
  const entries = useAtomValue(modulePanelEntriesState);
  const setTargets = useSetAtom(modulePanelTargetsState);
  useLayoutEffect(() => {
    const target = document.getElementById('chooser-target');
    if (target) {
      setTargets(
        Object.fromEntries(Object.keys(entries).map((path) => [path, target])),
      );
    }
  }, [entries, setTargets]);
  return <aside id="chooser-target" />;
};

it('opens only the selected variant chooser and updates only that variant', () => {
  mockPath = null;
  const chooseFirst = jest.fn();
  const chooseSecond = jest.fn();
  render(
    <Provider store={createStore()}>
      <ProductChooserSheet
        {...{ panelId: 'variant-a' }}
        onChoose={chooseFirst}
        onClear={jest.fn()}
      >
        <button>Swap first variant</button>
      </ProductChooserSheet>
      <ProductChooserSheet
        {...{ panelId: 'variant-b' }}
        onChoose={chooseSecond}
        onClear={jest.fn()}
      >
        <button>Swap second variant</button>
      </ProductChooserSheet>
      <PanelTarget />
    </Provider>,
  );

  fireEvent.click(screen.getByRole('button', { name: 'Swap second variant' }));
  expect(
    screen.getAllByPlaceholderText('Search by code or name…'),
  ).toHaveLength(1);
  fireEvent.click(screen.getByRole('button', { name: /Existing product/ }));
  expect(chooseFirst).not.toHaveBeenCalled();
  expect(chooseSecond).toHaveBeenCalledWith(
    expect.objectContaining({ _id: 'product' }),
  );
  expect(screen.queryByPlaceholderText('Search by code or name…')).toBeNull();
});
