/** @jest-environment jsdom */
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { createStore, Provider } from 'jotai';
import { MemoryRouter, useSearchParams } from 'react-router-dom';
import { BrandsEdit } from '../BrandsEdit';
import { CreateBrand } from '../CreateBrand';
import { modulePanelTargetsState } from '@/side-panel/states/modulePanelState';

const mockT = (key: string) => key;
const mockToast = jest.fn();
const mockPending: (() => void)[] = [];
const mockEdit = jest.fn((options: { onCompleted: () => void }) => {
  mockPending.push(options.onCompleted);
});
jest.mock('react-router-dom', () => {
  const util = jest.requireActual<typeof import('node:util')>('node:util');
  Object.assign(globalThis, {
    TextEncoder: util.TextEncoder,
    TextDecoder: util.TextDecoder,
  });
  return jest.requireActual('react-router-dom');
});
jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: mockT }),
}));
jest.mock('@/settings/brands/hooks/useBrandsAdd', () => ({
  useBrandsAdd: () => ({ brandsAdd: mockEdit, loading: false }),
}));
jest.mock('@/settings/brands/hooks/useBrandsEdit', () => ({
  useBrandsEdit: () => ({ handleEdit: mockEdit, loading: false }),
}));
jest.mock('@/settings/brands/hooks/useBrandById', () => {
  const records: Record<string, { name: string; description: string }> = {
    a: { name: 'Brand A', description: '' },
    b: { name: 'Brand B', description: '' },
  };
  return {
    useBrandById: ({ variables }: { variables: { id: string } }) => ({
      brand: records[variables.id],
    }),
  };
});
jest.mock('@/settings/brands/components/BrandsForm', () => ({
  BrandsForm: () => {
    const { register } = jest
      .requireActual<typeof import('react-hook-form')>('react-hook-form')
      .useFormContext<{ name: string }>();
    return <input aria-label="Brand name" {...register('name')} />;
  },
}));
jest.mock('erxes-ui', () => ({
  ...jest.requireActual(
    '../../../../../../../libs/erxes-ui/src/components/form',
  ),
  ...jest.requireActual(
    '../../../../../../../libs/erxes-ui/src/components/button',
  ),
  cn: (...classes: string[]) => classes.filter(Boolean).join(' '),
  Spinner: () => null,
  Kbd: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
  useScopedHotkeys: () => undefined,
  useSetHotkeyScope: () => () => undefined,
  usePreviousHotkeyScope: () => ({
    setHotkeyScopeAndMemorizePreviousScope: () => undefined,
  }),
  useToast: () => ({ toast: mockToast }),
  useQueryState: (key: string) => {
    const [params, setParams] = jest
      .requireActual<typeof import('react-router-dom')>('react-router-dom')
      .useSearchParams();
    return [
      params.get(key),
      (value: string | null) =>
        setParams((current) => {
          const next = new URLSearchParams(current);
          if (value) next.set(key, value);
          else next.delete(key);
          return next;
        }),
    ];
  },
}));
jest.mock('ui-modules', () => {
  const React = jest.requireActual<typeof import('react')>('react');
  return {
    SidePanelDraftContext: React.createContext(undefined),
    SidePanelRecordPathContext: React.createContext(null),
    sidePanelHistoryState: jest
      .requireActual<typeof import('jotai')>('jotai')
      .atom([]),
    usePermissionCheck: () => ({
      isLoaded: true,
      hasActionPermission: () => true,
    }),
    PanelFormLayout: ({
      children,
      saveLabel,
      onCancel,
    }: React.ComponentProps<typeof import('ui-modules').PanelFormLayout>) => (
      <>
        {children}
        <button type="button" onClick={onCancel}>
          cancel
        </button>
        <button type="submit">{saveLabel}</button>
      </>
    ),
    RecordSidePanel: {
      Header: ({ title }: { title: React.ReactNode }) => <h2>{title}</h2>,
    },
    useSidePanel: () => {
      const [params, setParams] = jest
        .requireActual<typeof import('react-router-dom')>('react-router-dom')
        .useSearchParams();
      return {
        path: params.get('panel'),
        canGoBack: false,
        openPath: (path: string) =>
          setParams((current) => {
            const next = new URLSearchParams(current);
            next.set('panel', path);
            return next;
          }),
        dismissPath: (path: string) =>
          setParams((current) => {
            const next = new URLSearchParams(current);
            if (next.get('panel') === path) next.delete('panel');
            return next;
          }),
      };
    },
  };
});

const Workspace = () => {
  const [params, setParams] = useSearchParams();
  return (
    <>
      <button
        onClick={() =>
          setParams((current) => {
            const next = new URLSearchParams(current);
            next.set('brand_id', 'b');
            return next;
          })
        }
      >
        Open B
      </button>
      <output aria-label="Selected brand">{params.get('brand_id')}</output>
      <BrandsEdit />
    </>
  );
};

it('keeps the replacement brand URL and unsaved input when an earlier save finishes', async () => {
  mockPending.length = 0;
  const store = createStore();
  const target = document.createElement('div');
  document.body.append(target);
  const path = '/module/settings%2Fbrands%2FBrandsEdit';
  store.set(modulePanelTargetsState, { [path]: target });
  const view = render(
    <Provider store={store}>
      <MemoryRouter
        initialEntries={[`/?brand_id=a&panel=${encodeURIComponent(path)}`]}
      >
        <Workspace />
      </MemoryRouter>
    </Provider>,
  );
  await waitFor(() =>
    expect(
      (screen.getByLabelText('Brand name') as HTMLInputElement).value,
    ).toBe('Brand A'),
  );
  fireEvent.click(screen.getByRole('button', { name: 'update' }));
  await waitFor(() => expect(mockPending).toHaveLength(1));
  fireEvent.click(screen.getByRole('button', { name: 'Open B' }));
  await waitFor(() =>
    expect(
      (screen.getByLabelText('Brand name') as HTMLInputElement).value,
    ).toBe('Brand B'),
  );
  fireEvent.change(screen.getByLabelText('Brand name'), {
    target: { value: 'Unsaved B' },
  });
  act(() => mockPending[0]());
  expect(screen.getByLabelText('Selected brand').textContent).toBe('b');
  expect((screen.getByLabelText('Brand name') as HTMLInputElement).value).toBe(
    'Unsaved B',
  );
  view.unmount();
  target.remove();
});

it('finishes a create submitted after opening and resets the next draft', async () => {
  mockPending.length = 0;
  const store = createStore();
  const target = document.createElement('div');
  document.body.append(target);
  store.set(modulePanelTargetsState, {
    '/module/settings%2Fbrands%2FCreateBrand': target,
  });
  const view = render(
    <Provider store={store}>
      <MemoryRouter>
        <CreateBrand />
      </MemoryRouter>
    </Provider>,
  );
  fireEvent.click(screen.getByRole('button', { name: /create-brand C/ }));
  fireEvent.change(await screen.findByLabelText('Brand name'), {
    target: { value: 'New brand' },
  });
  fireEvent.click(
    screen.getByRole('button', { name: 'create-brand', exact: true }),
  );
  await waitFor(() => expect(mockPending).toHaveLength(1));
  act(() => mockPending[0]());
  expect(screen.queryByLabelText('Brand name')).toBeNull();
  fireEvent.click(screen.getByRole('button', { name: /create-brand C/ }));
  expect(
    ((await screen.findByLabelText('Brand name')) as HTMLInputElement).value,
  ).toBe('');
  view.unmount();
  target.remove();
});
