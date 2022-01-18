import debug from 'debug';
import configs from '../../src/configs';

// export const debugInit = debug(`erxes-${configs.name}:init`);
export const debugDb = debug(`erxes-${configs.name}:db`);
export const debugBase = debug(`erxes-${configs.name}:base`);
// export const debugEngages = debug(`erxes-${configs.name}:contacts`);

export const debugRequest = (debugInstance, req) =>
  debugInstance(`
        Receiving ${req.path} request from ${req.headers.origin}
        body: ${JSON.stringify(req.body || {})}
        queryParams: ${JSON.stringify(req.query)}
    `);

export const debugInfo = debug(`erxes-${configs.name}:info`);
export const debugError = debug(`erxes-${configs.name}:error`);
