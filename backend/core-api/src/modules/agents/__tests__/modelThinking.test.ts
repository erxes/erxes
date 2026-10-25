/**
 * Per-model display names and thinking levels from the models.dev snapshot:
 * the three reasoning option types, clamping, provider translation and the
 * unknown-model fallback to the original five levels and mapping.
 */

jest.mock('@/agents/data/modelsDevSnapshot.json', () => ({
  providers: {
    openai: {
      modelsDevProvider: 'openai',
      models: {
        'gpt-6-luna': {
          id: 'gpt-6-luna',
          name: 'GPT-6 Luna',
          reasoning: true,
          reasoning_options: [
            {
              type: 'effort',
              values: ['none', 'low', 'medium', 'high', 'xhigh', 'max'],
            },
          ],
        },
        'gpt-5.6': { id: 'gpt-5.6', name: 'GPT-5.6', reasoning: true },
        'gpt-4o': { id: 'gpt-4o', name: 'GPT-4o', reasoning: false },
        'o-unnamed': { id: 'o-unnamed', reasoning: false },
      },
    },
    grok: {
      modelsDevProvider: 'xai',
      models: {
        'grok-4.5': {
          id: 'grok-4.5',
          name: 'Grok 4.5',
          reasoning: true,
          reasoning_options: [
            { type: 'effort', values: ['low', 'medium', 'high', 'xhigh'] },
          ],
        },
      },
    },
    kimi: {
      modelsDevProvider: 'moonshotai',
      models: {
        'kimi-k2.6': {
          id: 'kimi-k2.6',
          name: 'Kimi K2.6',
          reasoning: true,
          reasoning_options: [{ type: 'toggle' }],
        },
      },
    },
    'kimi-code': {
      modelsDevProvider: 'kimi-code-plan-cn',
      models: {
        'k3.1-pro': {
          id: 'k3.1-pro',
          name: 'Kimi K3.1 Pro',
          reasoning: true,
          reasoning_options: [
            { type: 'effort', values: ['low', 'high', 'max'] },
          ],
        },
        'kimi-for-coding': {
          id: 'kimi-for-coding',
          name: 'kimi-for-coding',
          reasoning: true,
          reasoning_options: [
            { type: 'effort', values: ['none', 'low', 'high', 'max'] },
          ],
        },
        'budget-model': {
          id: 'budget-model',
          name: 'Budget Model',
          reasoning: true,
          reasoning_options: [{ type: 'budget_tokens', min: 0, max: 24000 }],
        },
        'floor-budget-model': {
          id: 'floor-budget-model',
          name: 'Floor Budget',
          reasoning: true,
          reasoning_options: [{ type: 'budget_tokens', min: 2048, max: 8000 }],
        },
      },
    },
  },
}));

import {
  buildThinkingProviderOptions,
  clampThinkingLevel,
  getModelDisplayName,
  getModelThinking,
  isAgentsThinkingLevel,
  LEGACY_THINKING_LEVELS,
  normalizeThinkingLevel,
  thinkingOutputTokens,
} from '@/agents/modelThinking';

describe('display names', () => {
  it('uses the models.dev name', () => {
    expect(getModelDisplayName('openai', 'gpt-6-luna')).toBe('GPT-6 Luna');
    expect(getModelDisplayName('kimi-code', 'k3.1-pro')).toBe('Kimi K3.1 Pro');
  });

  it.each([
    ['a name that only repeats the id', 'kimi-code', 'kimi-for-coding'],
    ['a case-only repeat of the id', 'openai', 'gpt-5.6'],
    ['an entry without a name', 'openai', 'o-unnamed'],
    ['an unknown model', 'openai', 'gpt-99'],
    ['an unknown provider', 'other', 'gpt-6-luna'],
  ])('falls back to the raw id for %s', (_case, provider, model) => {
    expect(getModelDisplayName(provider, model)).toBeNull();
  });
});

describe('thinking options per model', () => {
  it('turns an effort list into levels, with none as Off', () => {
    expect(getModelThinking('openai', 'gpt-6-luna')).toEqual({
      kind: 'effort',
      levels: ['off', 'low', 'medium', 'high', 'xhigh', 'max'],
    });
  });

  it('never offers Off for k3.1-pro, which rejects thinking disabled', () => {
    expect(getModelThinking('kimi-code', 'k3.1-pro')).toEqual({
      kind: 'effort',
      levels: ['low', 'high', 'max'],
    });
    expect(normalizeThinkingLevel('kimi-code', 'k3.1-pro', 'off')).toBe('low');
    expect(
      buildThinkingProviderOptions('kimi-code', 'k3.1-pro', 'off'),
    ).toEqual({
      anthropic: { thinking: { type: 'enabled', budgetTokens: 4000 } },
    });
  });

  it('offers on/off for a toggle', () => {
    expect(getModelThinking('kimi', 'kimi-k2.6')).toEqual({
      kind: 'toggle',
      levels: ['off', 'high'],
    });
    expect(normalizeThinkingLevel('kimi', 'kimi-k2.6', 'medium')).toBe('high');
  });

  it('maps a token budget to Off/Low/Medium/High inside its range', () => {
    expect(getModelThinking('kimi-code', 'budget-model')).toEqual({
      kind: 'budget',
      levels: ['off', 'low', 'medium', 'high'],
    });
    expect(
      buildThinkingProviderOptions('kimi-code', 'budget-model', 'medium'),
    ).toEqual({
      anthropic: { thinking: { type: 'enabled', budgetTokens: 12000 } },
    });
    expect(
      buildThinkingProviderOptions('kimi-code', 'budget-model', 'off'),
    ).toBeUndefined();
    // A non-zero minimum means thinking cannot be switched off.
    expect(getModelThinking('kimi-code', 'floor-budget-model')?.levels).toEqual(
      ['low', 'medium', 'high'],
    );
    expect(
      buildThinkingProviderOptions('kimi-code', 'floor-budget-model', 'low'),
    ).toEqual({
      anthropic: { thinking: { type: 'enabled', budgetTokens: 2048 } },
    });
  });

  it('has no control for non-reasoning or always-reasoning models', () => {
    expect(getModelThinking('openai', 'gpt-4o')).toEqual({
      kind: 'none',
      levels: [],
    });
    expect(getModelThinking('openai', 'gpt-5.6')).toEqual({
      kind: 'fixed',
      levels: [],
    });
    expect(
      buildThinkingProviderOptions('openai', 'gpt-4o', 'high'),
    ).toBeUndefined();
    expect(
      buildThinkingProviderOptions('openai', 'gpt-5.6', 'high'),
    ).toBeUndefined();
  });

  it('is unknown (null) for models the snapshot lacks', () => {
    expect(getModelThinking('openai', 'gpt-99')).toBeNull();
  });
});

describe('clamping', () => {
  it('moves to the nearest supported level, preferring the deeper one', () => {
    expect(clampThinkingLevel('medium', ['low', 'high', 'max'])).toBe('high');
    expect(clampThinkingLevel('minimal', ['off', 'low', 'high'])).toBe('low');
    expect(clampThinkingLevel('max', ['low', 'medium', 'high', 'xhigh'])).toBe(
      'xhigh',
    );
    expect(clampThinkingLevel('off', ['low', 'high', 'max'])).toBe('low');
  });

  it('keeps supported levels and levels of models without a control', () => {
    expect(clampThinkingLevel('xhigh', ['off', 'xhigh'])).toBe('xhigh');
    expect(clampThinkingLevel('medium', [])).toBe('medium');
  });

  it('limits unknown models to the original five levels', () => {
    expect(LEGACY_THINKING_LEVELS).toEqual([
      'off',
      'minimal',
      'low',
      'medium',
      'high',
    ]);
    expect(normalizeThinkingLevel('openai', 'gpt-99', 'max')).toBe('high');
    expect(normalizeThinkingLevel('openai', 'gpt-99', 'minimal')).toBe(
      'minimal',
    );
  });

  it('accepts the larger vocabulary and rejects anything else', () => {
    expect(isAgentsThinkingLevel('xhigh')).toBe(true);
    expect(isAgentsThinkingLevel('max')).toBe(true);
    expect(isAgentsThinkingLevel('none')).toBe(false);
  });
});

describe('provider translation', () => {
  it('sends OpenAI native effort values, including none for Off', () => {
    expect(buildThinkingProviderOptions('openai', 'gpt-6-luna', 'off')).toEqual(
      {
        openai: { reasoningEffort: 'none' },
      },
    );
    expect(
      buildThinkingProviderOptions('openai', 'gpt-6-luna', 'xhigh'),
    ).toEqual({ openai: { reasoningEffort: 'xhigh' } });
  });

  it('sends grok effort under the provider key the OpenAI-compatible client reads', () => {
    expect(buildThinkingProviderOptions('grok', 'grok-4.5', 'off')).toEqual({
      grok: { reasoningEffort: 'low' },
    });
    expect(buildThinkingProviderOptions('grok', 'grok-4.5', 'max')).toEqual({
      grok: { reasoningEffort: 'xhigh' },
    });
  });

  it('switches Kimi toggle thinking on and off', () => {
    expect(buildThinkingProviderOptions('kimi', 'kimi-k2.6', 'off')).toEqual({
      kimi: { thinking: { type: 'disabled' } },
    });
    expect(buildThinkingProviderOptions('kimi', 'kimi-k2.6', 'high')).toEqual({
      kimi: { thinking: { type: 'enabled' } },
    });
  });

  it('keeps kimi-code budgets inside the output ceiling', () => {
    expect(
      buildThinkingProviderOptions('kimi-code', 'kimi-for-coding', 'off'),
    ).toBeUndefined();
    expect(
      buildThinkingProviderOptions('kimi-code', 'kimi-for-coding', 'max'),
    ).toEqual({
      anthropic: { thinking: { type: 'enabled', budgetTokens: 24000 } },
    });
    expect(
      thinkingOutputTokens('kimi-code', 'kimi-for-coding', 'high', 16384),
    ).toBe(32384);
    expect(
      thinkingOutputTokens('kimi-code', 'kimi-for-coding', 'max', 16384),
    ).toBe(32768);
    expect(thinkingOutputTokens('openai', 'gpt-6-luna', 'max', 16384)).toBe(
      16384,
    );
  });

  it('keeps the original mapping for models the snapshot lacks', () => {
    expect(
      buildThinkingProviderOptions('openai', 'gpt-99', 'off'),
    ).toBeUndefined();
    expect(buildThinkingProviderOptions('openai', 'gpt-99', 'minimal')).toEqual(
      {
        openai: { reasoningEffort: 'minimal' },
      },
    );
    expect(buildThinkingProviderOptions('openai', 'gpt-99', 'max')).toEqual({
      openai: { reasoningEffort: 'high' },
    });
    expect(
      buildThinkingProviderOptions('kimi-code', 'kimi-k9', 'medium'),
    ).toEqual({
      anthropic: { thinking: { type: 'enabled', budgetTokens: 10000 } },
    });
    expect(
      buildThinkingProviderOptions('kimi', 'kimi-k9', 'high'),
    ).toBeUndefined();
    expect(
      buildThinkingProviderOptions('grok', 'grok-9', 'high'),
    ).toBeUndefined();
    expect(thinkingOutputTokens('kimi-code', undefined, 'minimal', 16384)).toBe(
      17384,
    );
  });
});
