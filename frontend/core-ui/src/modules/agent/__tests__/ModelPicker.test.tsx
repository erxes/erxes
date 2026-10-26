/** @jest-environment jsdom */
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { createStore, Provider } from 'jotai';
import type { MutableRefObject, Ref } from 'react';
import { ModelPicker, type IModelPickerProps } from '../components/ModelPicker';
import { agentRecentModelsState } from '../states/agentRecentModelsState';

// Use the real erxes-ui/CMDK/Radix controls to cover search and keyboard behavior.
// The installed merge-refs package is ESM-only; Jest runs these controls in CJS.
jest.mock('react-merge-refs', () => ({
  mergeRefs:
    <T,>(refs: Ref<T>[]) =>
    (node: T | null) => {
      for (const ref of refs) {
        if (typeof ref === 'function') ref(node);
        else if (ref) (ref as MutableRefObject<T | null>).current = node;
      }
    },
}));
jest.mock('erxes-ui', () => ({
  ...jest.requireActual('../../../../../libs/erxes-ui/src/components/button'),
  ...jest.requireActual('../../../../../libs/erxes-ui/src/components/combobox'),
  ...jest.requireActual('../../../../../libs/erxes-ui/src/components/command'),
  ...jest.requireActual('../../../../../libs/erxes-ui/src/components/popover'),
  ...jest.requireActual('../../../../../libs/erxes-ui/src/components/spinner'),
}));
jest.mock('erxes-ui/lib', () =>
  jest.requireActual('../../../../../libs/erxes-ui/src/lib/utils'),
);
jest.mock('erxes-ui/lib/utils', () =>
  jest.requireActual('../../../../../libs/erxes-ui/src/lib/utils'),
);

const originalObserver = global.ResizeObserver;
const originalScroll = HTMLElement.prototype.scrollIntoView;
beforeAll(() => {
  global.ResizeObserver = jest.fn(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
  }));
  HTMLElement.prototype.scrollIntoView = jest.fn();
});
afterAll(() => {
  global.ResizeObserver = originalObserver;
  HTMLElement.prototype.scrollIntoView = originalScroll;
});

const defaults = [
  { provider: 'openai', model: 'gpt-6-luna' },
  { provider: 'kimi', model: 'kimi-k3' },
];
const modelIds = [
  'gpt-6-luna',
  ...Array.from({ length: 132 }, (_, i) => `catalog-model-${i}`),
];
const baseProps: IModelPickerProps = {
  value: 'openai|gpt-6-luna',
  onChange: jest.fn(),
  autoModel: 'gpt-6-luna',
  defaultModels: defaults,
  models: {
    loading: false,
    error: undefined,
    providerModels: [
      { provider: 'openai', models: modelIds },
      { provider: 'kimi', models: ['kimi-k3'] },
    ],
  },
};
const setup = (
  overrides: Partial<IModelPickerProps> = {},
  recent: string[] = [],
) => {
  const store = createStore();
  store.set(agentRecentModelsState, recent);
  const onChange = jest.fn();
  render(
    <Provider store={store}>
      <ModelPicker {...baseProps} {...overrides} onChange={onChange} />
    </Provider>,
  );
  fireEvent.click(screen.getByRole('combobox', { name: 'Model' }));
  return { store, onChange };
};

const chooseProvider = (name = 'OpenAI') =>
  fireEvent.click(screen.getByRole('option', { name: new RegExp(`^${name}`) }));

it('opens with providers, then shows only the chosen provider’s quick picks', async () => {
  const { onChange } = setup();
  expect(screen.getByText('Provider')).toBeTruthy();
  expect(screen.getAllByRole('option')).toHaveLength(3);
  expect(screen.queryByText('Your models')).toBeNull();
  expect(
    screen.queryByRole('button', { name: 'Browse all models' }),
  ).toBeNull();
  expect(screen.queryByText('133 models')).toBeNull();
  chooseProvider();
  expect(onChange).not.toHaveBeenCalled();
  expect(screen.getAllByRole('option')).toHaveLength(1);
  expect(screen.queryByRole('option', { name: /kimi-k3/ })).toBeNull();
  await waitFor(() =>
    expect(
      screen
        .getByRole('option', { name: /gpt-6-luna/ })
        .getAttribute('aria-selected'),
    ).toBe('true'),
  );
});

it('selects a provider then an exact model with the keyboard', async () => {
  const { onChange, store } = setup();
  expect(
    screen.queryByRole('combobox', { name: 'Search providers' }),
  ).toBeNull();
  const providerMenu = document.activeElement;
  if (!providerMenu) throw new Error('Provider menu was not focused');
  expect(providerMenu.hasAttribute('cmdk-root')).toBe(true);
  fireEvent.keyDown(providerMenu, { key: 'Enter' });
  expect(onChange).not.toHaveBeenCalled();
  const search = screen.getByRole('combobox', { name: 'Search models' });
  fireEvent.change(search, { target: { value: 'catalog-model-131' } });
  await waitFor(() => expect(screen.getAllByRole('option')).toHaveLength(1));
  fireEvent.keyDown(search, { key: 'ArrowDown' });
  fireEvent.keyDown(search, { key: 'Enter' });
  expect(onChange).toHaveBeenCalledWith('openai|catalog-model-131');
  expect(store.get(agentRecentModelsState)[0]).toBe('openai|catalog-model-131');
  await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
});

it('exposes only the selected provider’s complete catalog and returns to quick picks', () => {
  setup();
  chooseProvider();
  fireEvent.click(screen.getByRole('button', { name: 'Browse all models' }));
  expect(screen.getAllByRole('option')).toHaveLength(133);
  expect(screen.queryByRole('option', { name: /kimi-k3/ })).toBeNull();
  fireEvent.click(screen.getByRole('button', { name: 'Your models' }));
  expect(screen.getAllByRole('option')).toHaveLength(1);
});

it('can go back and switch providers without changing the selection', () => {
  const { onChange } = setup();
  chooseProvider();
  fireEvent.click(screen.getByRole('button', { name: 'Back to providers' }));
  chooseProvider('Kimi');
  expect(screen.getAllByRole('option')).toHaveLength(1);
  expect(screen.getByRole('option', { name: /kimi-k3/ })).toBeTruthy();
  expect(screen.queryByRole('option', { name: /gpt-6-luna/ })).toBeNull();
  expect(onChange).not.toHaveBeenCalled();
});

it('focuses a model from the newly chosen provider for keyboard selection', async () => {
  const { onChange } = setup();
  chooseProvider('Kimi');
  await waitFor(() =>
    expect(
      screen
        .getByRole('option', { name: /kimi-k3/ })
        .getAttribute('aria-selected'),
    ).toBe('true'),
  );
  fireEvent.keyDown(screen.getByRole('combobox', { name: 'Search models' }), {
    key: 'Enter',
  });
  expect(onChange).toHaveBeenCalledWith('kimi|kimi-k3');
});

it('bounds recent choices per provider and excludes unavailable models', () => {
  setup({}, [
    'openai|catalog-model-4',
    'kimi|kimi-k3',
    'removed|private',
    'openai|missing',
    'openai|catalog-model-3',
    'openai|catalog-model-2',
    'openai|catalog-model-1',
  ]);
  chooseProvider();
  expect(screen.getAllByRole('option')).toHaveLength(4);
  expect(screen.queryByRole('option', { name: /kimi-k3/ })).toBeNull();
  expect(screen.queryByText('private')).toBeNull();
  expect(screen.queryByText('missing')).toBeNull();
  expect(screen.getByRole('option', { name: /catalog-model-4/ })).toBeTruthy();
});

it.each([
  { loading: true, error: undefined },
  { loading: false, error: 'provider failure' },
])('keeps the saved default usable when discovery is unavailable', (state) => {
  const { onChange } = setup({ models: { ...state, providerModels: [] } });
  fireEvent.click(screen.getByRole('option', { name: /Use saved default/ }));
  expect(onChange).toHaveBeenCalledWith('');
});

it('scopes model search and always reopens at provider selection', async () => {
  setup();
  chooseProvider();
  const search = screen.getByRole('combobox', { name: 'Search models' });
  fireEvent.change(search, { target: { value: 'kimi-k3' } });
  expect(screen.getByRole('status').textContent).toContain(
    'No matching models',
  );
  fireEvent.keyDown(search, { key: 'Escape' });
  await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  fireEvent.click(screen.getByRole('combobox', { name: 'Model' }));
  expect(screen.queryByRole('combobox', { name: 'Search models' })).toBeNull();
  expect(
    screen.queryByRole('combobox', { name: 'Search providers' }),
  ).toBeNull();
  expect(screen.getByText('Provider')).toBeTruthy();
  expect(screen.getAllByRole('option')).toHaveLength(3);
});
