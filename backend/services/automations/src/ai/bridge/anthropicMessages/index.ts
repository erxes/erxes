export * from './invoke';
export * from './health';

import { checkAnthropicMessagesHealth } from './health';
import { invokeAnthropicMessages } from './invoke';
import { IAiProviderBridge } from '../types';

export const anthropicMessagesBridge: IAiProviderBridge = {
  checkHealth: checkAnthropicMessagesHealth,
  invoke: invokeAnthropicMessages,
};
