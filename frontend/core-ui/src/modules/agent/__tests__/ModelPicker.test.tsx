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

const saved = [
  { provider: 'openai', model: 'gpt-6-luna' },
  { provider: 'kimi', model: 'kimi-k3' },
];
const option = (id: string, recommended = false) => ({
  id,
  family: id.startsWith('gpt-6') ? 'gpt-6' : '',
  recommended,
});
const openaiModels = [
  option('gpt-6', true),
  option('gpt-6-luna', true),
  option('gpt-6-mini', true),
  ...Array.from({ length: 132 }, (_, i) => option(`catalog-model-${i}`)),
];
const baseProps: IModelPickerProps = {
  value: 'openai|gpt-6-luna',
  onChange: jest.fn(),
  savedModels: saved,
  models: {
    loading: false,
    error: undefined,
    providerModels: [
      { provider: 'openai', models: openaiModels },
      { provider: 'kimi', models: [option('kimi-k3', true)] },
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
const optionNames = () =>
  screen.getAllByRole('option').map((item) => item.textContent);

it('opens with providers, then shows the provider’s recommended models immediately', async () => {
  const { onChange } = setup({ value: '' });
  expect(screen.getByText('Provider')).toBeTruthy();
  expect(screen.getAllByRole('option')).toHaveLength(3);
  expect(screen.queryByText('Recommended')).toBeNull();
  expect(
    screen.queryByRole('button', { name: 'Browse all models' }),
  ).toBeNull();
  chooseProvider();
  expect(onChange).not.toHaveBeenCalled();
  expect(screen.getByText('Recommended')).toBeTruthy();
  expect(optionNames()).toEqual(['gpt-6', 'gpt-6-lunaDefault', 'gpt-6-mini']);
  expect(screen.queryByRole('option', { name: /kimi-k3/ })).toBeNull();
  expect(screen.queryByText('135 models')).toBeNull();
  await waitFor(() =>
    expect(
      screen
        .getByRole('option', { name: /^gpt-6$/ })
        .getAttribute('aria-selected'),
    ).toBe('true'),
  );
});

it('marks only the model an empty selection runs as Default', () => {
  setup({
    value: '',
    savedModels: [
      { provider: 'kimi-code', model: 'kimi-for-coding' },
      { provider: 'kimi', model: 'kimi-k3' },
    ],
    models: {
      loading: false,
      error: undefined,
      providerModels: [
        { provider: 'kimi-code', models: [option('kimi-for-coding', true)] },
        { provider: 'kimi', models: [option('kimi-k3', true)] },
      ],
    },
  });
  const trigger = screen.getByRole('combobox', { name: 'Model' });
  expect(trigger.textContent).toBe('kimi-for-coding');
  expect(trigger.getAttribute('title')).toBe(
    'Kimi Code · kimi-for-coding (saved default)',
  );
  expect(
    screen.getByRole('option', { name: /^Kimi Code/ }).textContent,
  ).toContain('In use');
  expect(
    screen.getByRole('option', { name: /Use saved default/ }).textContent,
  ).toContain('Kimi Code · kimi-for-coding');
  chooseProvider('Kimi$');
  expect(optionNames()).toEqual(['kimi-k3']);
  fireEvent.click(screen.getByRole('button', { name: 'Back to providers' }));
  chooseProvider('Kimi Code');
  expect(optionNames()).toEqual(['kimi-for-codingDefault']);
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
  expect(screen.getByText('Others')).toBeTruthy();
  fireEvent.keyDown(search, { key: 'ArrowDown' });
  fireEvent.keyDown(search, { key: 'Enter' });
  expect(onChange).toHaveBeenCalledWith('openai|catalog-model-131');
  expect(store.get(agentRecentModelsState)[0]).toBe('openai|catalog-model-131');
  await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
});

it('browses the selected provider’s complete usable catalog in groups', () => {
  setup();
  chooseProvider();
  fireEvent.click(screen.getByRole('button', { name: 'Browse all models' }));
  expect(screen.getAllByRole('option')).toHaveLength(135);
  expect(screen.getByText('Recommended')).toBeTruthy();
  expect(screen.getByText('Others')).toBeTruthy();
  expect(screen.queryByRole('option', { name: /kimi-k3/ })).toBeNull();
  fireEvent.click(screen.getByRole('button', { name: 'Show less' }));
  expect(screen.getAllByRole('option')).toHaveLength(3);
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

it('lists bounded recent choices above recommendations and excludes unavailable models', () => {
  setup({}, [
    'openai|catalog-model-4',
    'kimi|kimi-k3',
    'removed|private',
    'openai|missing',
    'openai|gpt-6-mini',
    'openai|catalog-model-3',
    'openai|catalog-model-2',
    'openai|catalog-model-1',
  ]);
  chooseProvider();
  expect(screen.getByText('Recent')).toBeTruthy();
  expect(optionNames()).toEqual([
    'catalog-model-4',
    'catalog-model-3',
    'catalog-model-2',
    'gpt-6',
    'gpt-6-lunaDefault',
    'gpt-6-mini',
  ]);
  expect(screen.queryByText('private')).toBeNull();
  expect(screen.queryByText('missing')).toBeNull();
});

it('explains a provider whose listing failed and keeps its saved model', () => {
  const { onChange } = setup({
    value: '',
    models: {
      loading: false,
      error: undefined,
      providerModels: [
        {
          provider: 'openai',
          models: [],
          error:
            'Failed to list models for "openai" (401). Check your API key.',
        },
        { provider: 'kimi', models: [option('kimi-k3', true)] },
      ],
    },
  });
  // A failed listing never hides the provider the saved default runs on.
  expect(screen.getByRole('option', { name: /^OpenAI/ }).textContent).toContain(
    'In use',
  );
  chooseProvider();
  expect(screen.getByRole('status').textContent).toContain(
    'Check your API key',
  );
  expect(screen.getByText('Saved model')).toBeTruthy();
  expect(
    screen.queryByRole('button', { name: 'Browse all models' }),
  ).toBeNull();
  fireEvent.click(screen.getByRole('option', { name: /gpt-6-luna/ }));
  expect(onChange).toHaveBeenCalledWith('openai|gpt-6-luna');
});

it('flags an unavailable provider that is not in use', () => {
  setup({
    models: {
      loading: false,
      error: undefined,
      providerModels: [
        { provider: 'openai', models: openaiModels },
        { provider: 'kimi', models: [], error: 'Could not reach kimi.' },
      ],
    },
  });
  expect(screen.getByRole('option', { name: /^Kimi/ }).textContent).toContain(
    'Unavailable',
  );
});

it('shows an empty state when a provider lists no usable models', () => {
  setup({
    models: {
      loading: false,
      error: undefined,
      providerModels: [{ provider: 'openai', models: [] }],
    },
  });
  chooseProvider();
  expect(screen.getByRole('status').textContent).toContain(
    'No usable chat models',
  );
  expect(screen.queryAllByRole('option')).toHaveLength(0);
});

it('shows provider loading while discovery is pending', () => {
  setup({ models: { loading: true, error: undefined, providerModels: [] } });
  chooseProvider();
  expect(screen.getByRole('status').textContent).toContain(
    'Loading OpenAI models',
  );
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
