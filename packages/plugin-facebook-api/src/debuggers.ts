import * as debug from 'debug';

export const debugInit = debug('erxes-facebook:init');
export const debugDb = debug('erxes-facebook:db');

export const debugBase = debug('erxes-facebook:base');
export const debugFacebook = debug('erxes-facebook:facebook');

export const debugExternalRequests = debug('erxes-facebook:external-requests');

export const debugError = debug('erxes-facebook:error');

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
