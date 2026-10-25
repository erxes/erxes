import { useEffect } from 'react';

import type { IAgentsThinkingLevel } from './useAgentsChat';
import {
  isAgentsThinkingLevel,
  thinkingLevelsFor,
  type IAgentsModelThinking,
} from '../utils/thinkingLevels';

/**
 * Reports the levels of the model a turn runs on, so sends are clamped to
 * the nearest supported one (k3.1-pro never receives Off). The user's choice
 * itself is never rewritten: switching back to a deeper model restores it.
 */
export const useThinkingLevelClamp = (
  thinking: IAgentsModelThinking | null,
  setLevels: (levels: readonly IAgentsThinkingLevel[]) => void,
): void => {
  // A string key: the catalog may rebuild equal option objects.
  const supported = thinkingLevelsFor(thinking).join(',');

  useEffect(() => {
    setLevels(supported.split(',').filter(isAgentsThinkingLevel));
  }, [supported, setLevels]);
};
