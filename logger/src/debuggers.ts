import * as debug from 'debug';
import * as dotenv from 'dotenv';

dotenv.config();

export const debugInit = debug('erxes-logger:init');
export const debugDb = debug('erxes-logger:db');
export const debugBase = debug('erxes-logger:base');
export const debugExternalRequests = debug('erxes-logger:external-requests');

export const debugRequest = (debugInstance, req) =>
  debugInstance(`
        Receiving ${req.path} request from ${req.headers.origin}
        body: ${JSON.stringify(req.body || {})}
        queryParams: ${JSON.stringify(req.query)}
    `);
