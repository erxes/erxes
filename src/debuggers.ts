import * as debug from 'debug';

export const debugInit = debug('erxes-integrations:init');
export const debugDb = debug('erxes-integrations:db');
export const debugIntegrations = debug('erxes-integrations:integrations');
export const debugFacebook = debug('erxes-integrations:facebook');
export const debugExternalRequests = debug('erxes-integrations:external-requests');

export const debugRequest = (debugInstance, req) =>
  debugInstance(`
        Receiving ${req.path} request from ${req.headers.origin}
        body: ${JSON.stringify(req.body || {})}
        queryParams: ${JSON.stringify(req.query)}
    `);

export const debugResponse = (debugInstance, req, data = 'success') =>
  debugInstance(`Responding ${req.path} request to ${req.headers.origin} with ${data}`);
