import debug from 'debug';

export const debugInit = debug('erxes-engages:init');
export const debugDb = debug('erxes-engages:db');
export const debugBase = debug('erxes-engages:base');
export const debugEngages = debug('erxes-engages:engages');
export const debugError = debug('erxes-engages:error');

export const debugRequest = (debugInstance, req) =>
  debugInstance(`
        Receiving ${req.path} request from ${req.headers.origin}
        body: ${JSON.stringify(req.body || {})}
        queryParams: ${JSON.stringify(req.query)}
    `);
