/** @jest-environment jsdom */
import { renderHook } from '@testing-library/react';

import { useThinkingLevelClamp } from '../hooks/useThinkingLevelClamp';
import {
  clampThinkingLevel,
  findModelThinking,
  toModelThinking,
  type IAgentsModelThinking,
} from '../utils/thinkingLevels';

const K31_PRO: IAgentsModelThinking = {
  kind: 'effort',
  levels: ['low', 'high', 'max'],
};
const GPT_6: IAgentsModelThinking = {
  kind: 'effort',
  levels: ['off', 'low', 'medium', 'high', 'xhigh', 'max'],
};

describe('thinking level utilities', () => {
  it('clamps to the nearest supported level, preferring the deeper one', () => {
    expect(clampThinkingLevel('off', K31_PRO.levels)).toBe('low');
    expect(clampThinkingLevel('medium', K31_PRO.levels)).toBe('high');
    expect(clampThinkingLevel('xhigh', GPT_6.levels)).toBe('xhigh');
    expect(clampThinkingLevel('medium', [])).toBe('medium');
  });

  it('accepts only known kinds and levels from the server', () => {
    expect(
      toModelThinking({
        kind: 'effort',
        levels: ['max', 'low', 'turbo', null],
      }),
    ).toEqual({ kind: 'effort', levels: ['low', 'max'] });
    expect(toModelThinking({ kind: 'mystery', levels: ['low'] })).toBeNull();
    expect(toModelThinking(null)).toBeNull();
  });

  it('finds the thinking of the model a turn runs on', () => {
    const catalog = [
      {
        provider: 'kimi-code',
        models: [{ id: 'k3.1-pro', thinking: K31_PRO }],
      },
      { provider: 'openai', models: [{ id: 'gpt-99' }] },
    ];

    expect(
      findModelThinking(catalog, { provider: 'kimi-code', model: 'k3.1-pro' }),
    ).toBe(K31_PRO);
    expect(
      findModelThinking(catalog, { provider: 'openai', model: 'gpt-99' }),
    ).toBeNull();
    expect(findModelThinking(catalog, undefined)).toBeNull();
  });
});

describe('useThinkingLevelClamp', () => {
  const render = (thinking: IAgentsModelThinking | null) => {
    const setLevels = jest.fn();
    const hook = renderHook(
      (props: { thinking: IAgentsModelThinking | null }) =>
        useThinkingLevelClamp(props.thinking, setLevels),
      { initialProps: { thinking } },
    );
    return { ...hook, setLevels };
  };

  it.each([
    ['k3.1-pro’s own levels', K31_PRO, ['low', 'high', 'max']],
    [
      'the original five for an unknown model',
      null,
      ['off', 'minimal', 'low', 'medium', 'high'],
    ],
    [
      'no levels for a model without a choice',
      { kind: 'none', levels: [] },
      [],
    ],
  ] as const)('reports %s', (_case, thinking, levels) => {
    const { setLevels } = render(thinking as IAgentsModelThinking | null);
    expect(setLevels).toHaveBeenLastCalledWith(levels);
  });

  it('does not report again when the catalog rebuilds equal options', () => {
    const { rerender, setLevels } = render(K31_PRO);
    rerender({ thinking: { ...K31_PRO, levels: [...K31_PRO.levels] } });
    expect(setLevels).toHaveBeenCalledTimes(1);
  });
});
