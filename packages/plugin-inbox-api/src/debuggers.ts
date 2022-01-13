import debug from 'debug';

export const debugInit = debug('erxes-inbox:init');
export const debugDb = debug('erxes-inbox:db');
export const debugBase = debug('erxes-inbox:base');
export const debugEngages = debug('erxes-inbox:inboxs');
export const debugError = debug('erxes-inbox:error');

export const debugRequest = (debugInstance, req) =>
  debugInstance(`
        Receiving ${req.path} request from ${req.headers.origin}
        body: ${JSON.stringify(req.body || {})}
        queryParams: ${JSON.stringify(req.query)}
    `);
