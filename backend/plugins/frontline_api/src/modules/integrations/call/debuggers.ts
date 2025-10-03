const debug = require('debug');

export const debugInit = debug('erxes-call:init');
export const debugDb = debug('erxes-call:db');

export const debugBase = debug('erxes-call:base');
export const debugCall = debug('erxes-call:call');

export const debugExternalRequests = debug('erxes-call:external-requests');

export const debugError = debug('erxes-call:error');

export const debugRequest = (debugInstance, req) =>
  debugInstance(`
        Receiving ${req.path} request from ${req.headers.origin}
        body: ${JSON.stringify(req.body || {})}
        queryParams: ${JSON.stringify(req.query)}
    `);

export const debugResponse = (debugInstance, req, data = 'success') =>
  debugInstance(
    `Responding ${req.path} request to ${req.headers.origin} with ${data}`,
  );
