/** @jest-environment jsdom */
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
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

it('follows the explicit default rather than the first saved connection', () => {
  setup({
    value: '',
    savedModels: [
      { provider: 'openai', model: 'gpt-6-luna', isDefault: false },
      { provider: 'kimi', model: 'kimi-k3', isDefault: true },
    ],
  });
  const trigger = screen.getByRole('combobox', { name: 'Model' });
  expect(trigger.textContent).toBe('kimi-k3');
  expect(trigger.getAttribute('title')).toBe('Kimi · kimi-k3 (saved default)');
  expect(screen.getByRole('option', { name: /^Kimi/ }).textContent).toContain(
    'In use',
  );
  expect(
    screen.getByRole('option', { name: /^OpenAI/ }).textContent,
  ).not.toContain('In use');
  expect(
    screen.getByRole('option', { name: /Use saved default/ }).textContent,
  ).toContain('Kimi · kimi-k3');
  chooseProvider();
  expect(optionNames()).toEqual(['gpt-6', 'gpt-6-luna', 'gpt-6-mini']);
  fireEvent.click(screen.getByRole('button', { name: 'Back to providers' }));
  chooseProvider('Kimi');
  expect(optionNames()).toEqual(['kimi-k3Default']);
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
    value: '',
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

describe('typed model ids', () => {
  const forbidden = {
    loading: false,
    error: undefined,
    providerModels: [
      {
        provider: 'openai',
        models: [],
        error:
          "This OpenAI key can't list models (missing Models: Read permission). Type a model id to use it, or allow Models: Read for the key.",
      },
    ],
  };
  const typeModel = (text: string) =>
    fireEvent.change(screen.getByRole('combobox', { name: 'Search models' }), {
      target: { value: text },
    });

  it('verifies and selects a model the key cannot list', async () => {
    const onVerifyModel = jest.fn(async () => null);
    const { onChange, store } = setup({
      value: '',
      models: forbidden,
      onVerifyModel,
    });
    chooseProvider();
    expect(screen.getByRole('status').textContent).toContain(
      'missing Models: Read permission',
    );
    expect(optionNames()).toEqual(['gpt-6-lunaDefault']);

    typeModel(' gpt-5.6-luna ');
    fireEvent.click(screen.getByRole('option', { name: 'Use "gpt-5.6-luna"' }));

    await waitFor(() =>
      expect(onChange).toHaveBeenCalledWith('openai|gpt-5.6-luna'),
    );
    expect(onVerifyModel).toHaveBeenCalledWith('openai', 'gpt-5.6-luna');
    expect(store.get(agentRecentModelsState)[0]).toBe('openai|gpt-5.6-luna');
  });

  it('shows why a typed model was rejected and keeps the selection', async () => {
    const onVerifyModel = jest.fn(
      async () => 'OpenAI rejected "gpt-7" (404): The model does not exist.',
    );
    const { onChange } = setup({ models: forbidden, onVerifyModel });
    chooseProvider();
    typeModel('gpt-7');
    fireEvent.click(screen.getByRole('option', { name: 'Use "gpt-7"' }));

    expect(
      await screen.findByText(
        'OpenAI rejected "gpt-7" (404): The model does not exist.',
      ),
    ).toBeTruthy();
    expect(onChange).not.toHaveBeenCalled();
    typeModel('gpt-7-mini');
    expect(screen.queryByText(/rejected "gpt-7"/)).toBeNull();
  });

  it.each([
    [
      'the picker closed',
      () => fireEvent.keyDown(document.body, { key: 'Escape' }),
      [],
    ],
    [
      'another choice was picked',
      () => {
        fireEvent.click(
          screen.getByRole('button', { name: 'Back to providers' }),
        );
        fireEvent.click(
          screen.getByRole('option', { name: /Use saved default/ }),
        );
      },
      [['']],
    ],
    ['the search text changed', () => typeModel('gpt-5.6-luna-mini'), []],
  ])(
    'ignores a model check that resolves after %s',
    async (_case, interrupt, calls) => {
      let resolveCheck: (error: string | null) => void = () => undefined;
      const onVerifyModel = jest.fn(
        () =>
          new Promise<string | null>((resolve) => {
            resolveCheck = resolve;
          }),
      );
      const { onChange } = setup({ models: forbidden, onVerifyModel });
      chooseProvider();
      typeModel('gpt-5.6-luna');
      fireEvent.click(
        screen.getByRole('option', { name: 'Use "gpt-5.6-luna"' }),
      );
      expect(onVerifyModel).toHaveBeenCalledTimes(1);

      interrupt();
      await act(async () => resolveCheck(null));

      expect(onChange.mock.calls).toEqual(calls);
    },
  );

  it('offers recent picks when the provider cannot list models', () => {
    setup({ value: '', models: forbidden }, [
      'openai|gpt-5.6-luna',
      'kimi|kimi-k3',
    ]);
    chooseProvider();
    expect(screen.getByText('Recent')).toBeTruthy();
    expect(optionNames()).toEqual(['gpt-6-lunaDefault', 'gpt-5.6-luna']);
  });

  it('keeps a verified unlisted selection visible next to the catalog', () => {
    setup({ value: 'openai|gpt-6-luna-preview' });
    chooseProvider();
    expect(optionNames()[0]).toBe('gpt-6-luna-preview');
  });

  it('only offers custom ids that are unlisted, valid and verifiable', () => {
    setup({ onVerifyModel: jest.fn(async () => null) });
    chooseProvider();
    typeModel('gpt-6-luna');
    expect(screen.queryByRole('option', { name: /^Use "/ })).toBeNull();
    typeModel('gpt 6');
    expect(screen.queryByRole('option', { name: /^Use "/ })).toBeNull();
    typeModel('gpt-6-nano');
    expect(
      screen.getByRole('option', { name: 'Use "gpt-6-nano"' }),
    ).toBeTruthy();
  });

  it('offers no custom ids without a verifier', () => {
    setup({ models: forbidden });
    chooseProvider();
    typeModel('gpt-6-nano');
    expect(screen.queryByRole('option', { name: /^Use "/ })).toBeNull();
  });
});

describe('access checks for listed models', () => {
  it('checks a listed model the user has not used before', async () => {
    const onVerifyModel = jest.fn(
      async () =>
        'OpenAI rejected "gpt-6" (403): Project does not have access to model gpt-6.',
    );
    const { onChange } = setup({ onVerifyModel });
    chooseProvider();
    fireEvent.click(screen.getByRole('option', { name: /^gpt-6$/ }));

    expect(
      await screen.findByText(/Project does not have access to model gpt-6/),
    ).toBeTruthy();
    expect(onVerifyModel).toHaveBeenCalledWith('openai', 'gpt-6');
    expect(onChange).not.toHaveBeenCalled();
  });

  it('selects a listed model once the provider accepts it', async () => {
    const onVerifyModel = jest.fn(async () => null);
    const { onChange } = setup({ onVerifyModel });
    chooseProvider();
    fireEvent.click(screen.getByRole('option', { name: /^gpt-6-mini$/ }));

    await waitFor(() =>
      expect(onChange).toHaveBeenCalledWith('openai|gpt-6-mini'),
    );
  });

  it('skips the check for current, saved and recent selections', () => {
    const onVerifyModel = jest.fn(async () => null);
    const { onChange } = setup({ value: '', onVerifyModel }, [
      'openai|gpt-6-mini',
    ]);
    chooseProvider();
    fireEvent.click(screen.getByRole('option', { name: /^gpt-6-mini$/ }));
    expect(onChange).toHaveBeenCalledWith('openai|gpt-6-mini');

    fireEvent.click(screen.getByRole('combobox', { name: 'Model' }));
    chooseProvider();
    fireEvent.click(screen.getByRole('option', { name: /^gpt-6-luna/ }));
    expect(onChange).toHaveBeenLastCalledWith('openai|gpt-6-luna');
    expect(onVerifyModel).not.toHaveBeenCalled();
  });
});

describe('display names', () => {
  const named = {
    loading: false,
    error: undefined,
    providerModels: [
      {
        provider: 'openai',
        models: [
          { ...option('gpt-6-luna', true), name: 'GPT-6 Luna' },
          option('gpt-6', true),
        ],
      },
    ],
  };

  it('titles a model with its name and shows the id muted', () => {
    setup({ value: 'openai|gpt-6-luna', models: named });
    expect(screen.getByRole('combobox', { name: 'Model' }).textContent).toBe(
      'GPT-6 Luna',
    );
    chooseProvider();
    const row = screen.getByRole('option', { name: /^GPT-6 Luna/ });
    expect(row.querySelector('.text-muted-foreground')?.textContent).toBe(
      'gpt-6-luna',
    );
    // A model without a name keeps its raw id only.
    expect(screen.getByRole('option', { name: /^gpt-6$/ }).textContent).toBe(
      'gpt-6',
    );
  });

  it('finds a model by its name or its id', () => {
    setup({ models: named });
    chooseProvider();
    const search = screen.getByRole('combobox', { name: 'Search models' });
    fireEvent.change(search, { target: { value: 'luna' } });
    expect(optionNames()).toEqual(['GPT-6 Lunagpt-6-lunaDefault']);
    fireEvent.change(search, { target: { value: 'GPT-6 L' } });
    expect(optionNames()).toEqual(['GPT-6 Lunagpt-6-lunaDefault']);
  });
});
