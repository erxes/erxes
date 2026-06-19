import { buildReasoningProviderOptions, isReasoningEffort } from '../providers';

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
    expect(buildReasoningProviderOptions('openai')).toBeUndefined();
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

  it('maps Anthropic to a thinking budget per level, disabling on off', () => {
    expect(buildReasoningProviderOptions('anthropic', 'low')).toEqual({
      anthropic: { thinking: { type: 'enabled', budgetTokens: 2048 } },
    });
    expect(buildReasoningProviderOptions('anthropic', 'medium')).toEqual({
      anthropic: { thinking: { type: 'enabled', budgetTokens: 8192 } },
    });
    expect(buildReasoningProviderOptions('anthropic', 'high')).toEqual({
      anthropic: { thinking: { type: 'enabled', budgetTokens: 16384 } },
    });
    expect(buildReasoningProviderOptions('anthropic', 'off')).toEqual({
      anthropic: { thinking: { type: 'disabled' } },
    });
  });

  it('maps Google to a thinking budget per level, zero on off', () => {
    expect(buildReasoningProviderOptions('google', 'low')).toEqual({
      google: { thinkingConfig: { thinkingBudget: 2048 } },
    });
    expect(buildReasoningProviderOptions('google', 'medium')).toEqual({
      google: { thinkingConfig: { thinkingBudget: 8192 } },
    });
    expect(buildReasoningProviderOptions('google', 'high')).toEqual({
      google: { thinkingConfig: { thinkingBudget: 16384 } },
    });
    expect(buildReasoningProviderOptions('google', 'off')).toEqual({
      google: { thinkingConfig: { thinkingBudget: 0 } },
    });
  });

  it('maps OpenAI minimal/low/medium/high without a budget', () => {
    for (const level of ['low', 'medium', 'high'] as const) {
      expect(buildReasoningProviderOptions('openai', level)).toEqual({
        openai: { reasoningEffort: level },
      });
    }
  });
});
