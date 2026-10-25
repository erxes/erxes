import { useEffect } from 'react';

import type { IAgentsThinkingLevel } from './useAgentsChat';
import {
  clampThinkingLevel,
  isAgentsThinkingLevel,
  thinkingLevelsFor,
  type IAgentsModelThinking,
} from '../utils/thinkingLevels';

/**
 * Keeps the chosen thinking level valid for the model a turn runs on: when
 * the model changes, an unsupported level moves to the nearest supported one
 * (k3.1-pro never keeps Off). Models without a level choice keep the level.
 */
export const useThinkingLevelClamp = (
  thinking: IAgentsModelThinking | null,
  level: IAgentsThinkingLevel,
  onChange: (level: IAgentsThinkingLevel) => void,
): void => {
  // A string key: the catalog may rebuild equal option objects.
  const supported = thinkingLevelsFor(thinking).join(',');

  useEffect(() => {
    const next = clampThinkingLevel(
      level,
      supported.split(',').filter(isAgentsThinkingLevel),
    );

    if (next !== level) {
      onChange(next);
    }
  }, [supported, level, onChange]);
};
