import debug from 'debug';

export let debugInfo;
export let debugError;

export function initDebuggers(configs: any) {
  debugInfo = debug(`erxes-${configs.name}:info`);
  debugError = debug(`erxes-${configs.name}:error`);
}
