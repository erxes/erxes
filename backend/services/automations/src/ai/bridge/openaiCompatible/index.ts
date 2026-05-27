export * from './types';
export * from './health';
export * from './invoke';

import { checkOpenAiCompatibleHealth } from './health';
import { invokeOpenAiCompatible } from './invoke';

export const openAiCompatibleBridge = {
  checkHealth: checkOpenAiCompatibleHealth,
  invoke: invokeOpenAiCompatible,
};
