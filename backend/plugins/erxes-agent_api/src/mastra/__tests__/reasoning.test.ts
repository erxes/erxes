import {
  buildReasoningProviderOptions,
  isReasoningEffort,
} from '../providers';

describe('isReasoningEffort', () => {
  it('accepts the four levels', () => {
    for (const v of ['off', 'low', 'medium', 'high']) {
      expect(isReasoningEffort(v)).toBe(true);
    }
  });

  it('rejects anything else', () => {
    for (const v of ['auto', 'HIGH', '', 1, null, undefined, {}]) {
      expect(isReasoningEffort(v)).toBe(false);
    }
  });
});

describe('buildReasoningProviderOptions', () => {
  it('returns undefined when effort is unset (default behaviour)', () => {
    expect(buildReasoningProviderOptions('openai', undefined)).toBeUndefined();
    expect(buildReasoningProviderOptions('anthropic')).toBeUndefined();
  });

  it('returns undefined for providers without a known reasoning knob', () => {
    expect(buildReasoningProviderOptions('groq', 'high')).toBeUndefined();
    expect(buildReasoningProviderOptions('kimi', 'high')).toBeUndefined();
    expect(buildReasoningProviderOptions('mistral', 'low')).toBeUndefined();
  });

  it('maps OpenAI effort, collapsing off to minimal', () => {
    expect(buildReasoningProviderOptions('openai', 'high')).toEqual({
      openai: { reasoningEffort: 'high' },
    });
    expect(buildReasoningProviderOptions('openai', 'off')).toEqual({
      openai: { reasoningEffort: 'minimal' },
    });
  });

  it('maps Anthropic to a thinking budget, disabling on off', () => {
    expect(buildReasoningProviderOptions('anthropic', 'medium')).toEqual({
      anthropic: { thinking: { type: 'enabled', budgetTokens: 8192 } },
    });
    expect(buildReasoningProviderOptions('anthropic', 'off')).toEqual({
      anthropic: { thinking: { type: 'disabled' } },
    });
  });

  it('maps Google to a thinking budget, zero on off', () => {
    expect(buildReasoningProviderOptions('google', 'low')).toEqual({
      google: { thinkingConfig: { thinkingBudget: 2048 } },
    });
    expect(buildReasoningProviderOptions('google', 'off')).toEqual({
      google: { thinkingConfig: { thinkingBudget: 0 } },
    });
  });
});
