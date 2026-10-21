export * from './types';
export * from './health';
export * from './invoke';
export * from './models';

import { checkOpenAiCompatibleHealth } from './health';
import { invokeOpenAiCompatible } from './invoke';
import { listOpenAiCompatibleModels } from './models';

export const openAiCompatibleBridge = {
  checkHealth: checkOpenAiCompatibleHealth,
  invoke: invokeOpenAiCompatible,
  listModels: listOpenAiCompatibleModels,
};
