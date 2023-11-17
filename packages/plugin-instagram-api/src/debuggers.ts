import * as debug from 'debug';

export const debugInit = debug('erxes-instagram:init');
export const debugDb = debug('erxes-instagram:db');

export const debugBase = debug('erxes-instagram:base');
export const debugInstagram = debug('erxes-instagram:instagram');

export const debugExternalRequests = debug('erxes-instagram:external-requests');

export const debugError = debug('erxes-instagram:error');

export const debugRequest = (debugInstance, req) =>
  debugInstance(`
        Receiving ${req.path} request from ${req.headers.origin}
        body: ${JSON.stringify(req.body || {})}
        queryParams: ${JSON.stringify(req.query)}
    `);

export const debugResponse = (debugInstance, req, data = 'success') =>
  debugInstance(
    `Responding ${req.path} request to ${req.headers.origin} with ${data}`
  );
