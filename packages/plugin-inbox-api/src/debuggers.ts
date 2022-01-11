import debug from 'debug';

export const debugInit = debug('erxes-inboxs:init');
export const debugDb = debug('erxes-inboxs:db');
export const debugBase = debug('erxes-inboxs:base');
export const debugEngages = debug('erxes-inboxs:inboxs');
export const debugError = debug('erxes-inboxs:error');

export const debugRequest = (debugInstance, req) =>
  debugInstance(`
        Receiving ${req.path} request from ${req.headers.origin}
        body: ${JSON.stringify(req.body || {})}
        queryParams: ${JSON.stringify(req.query)}
    `);
