/** @jest-environment jsdom */
import { renderHook } from '@testing-library/react';

import type { IAgentsThinkingLevel } from '../hooks/useAgentsChat';
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
  const render = (
    thinking: IAgentsModelThinking | null,
    level: IAgentsThinkingLevel,
  ) => {
    const onChange = jest.fn();
    const hook = renderHook(
      (props: {
        thinking: IAgentsModelThinking | null;
        level: IAgentsThinkingLevel;
      }) => useThinkingLevelClamp(props.thinking, props.level, onChange),
      { initialProps: { thinking, level } },
    );
    return { ...hook, onChange };
  };

  it('moves Off to the nearest level when switching to k3.1-pro', () => {
    const { rerender, onChange } = render(GPT_6, 'off');
    expect(onChange).not.toHaveBeenCalled();

    rerender({ thinking: K31_PRO, level: 'off' });
    expect(onChange).toHaveBeenCalledWith('low');
  });

  it('limits an unknown model to the original five levels', () => {
    const { onChange } = render(null, 'max');
    expect(onChange).toHaveBeenCalledWith('high');
  });

  it('leaves the level alone for models without a level choice', () => {
    const { onChange } = render({ kind: 'none', levels: [] }, 'xhigh');
    expect(onChange).not.toHaveBeenCalled();
  });

  it('does not loop when the catalog rebuilds equal options', () => {
    const { rerender, onChange } = render(K31_PRO, 'high');
    rerender({
      thinking: { ...K31_PRO, levels: [...K31_PRO.levels] },
      level: 'high',
    });
    expect(onChange).not.toHaveBeenCalled();
  });
});
