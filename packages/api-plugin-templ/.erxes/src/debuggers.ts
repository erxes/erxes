import debug from 'debug';
import configs from '../../src/configs';

export const debugInfo = debug(`erxes-${configs.name}:info`);
export const debugError = debug(`erxes-${configs.name}:error`);
