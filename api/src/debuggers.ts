import * as debug from 'debug';

export const debugExternalApi = debug('erxes-api:external-api-fetcher');
export const debugInit = debug('erxes-api:init');
export const debugCrons = debug('erxes-crons:');
export const debugWorkers = debug('erxes-workers:');
export const debugDb = debug('erxes-api:db');
export const debugImport = debug('erxes-api:import');
export const debugBase = debug('erxes-api:base');
export const debugEmail = debug('erxes-api:email');
export const debugError = debug('erxes-api:error');

export const debugRequest = (debugInstance, req) =>
  debugInstance(`
        Receiving ${req.path} request from ${req.headers.origin}
        header: ${JSON.stringify(req.headers || {})}
        body: ${JSON.stringify(req.body || {})}
        queryParams: ${JSON.stringify(req.query)}
    `);

export const debugResponse = (debugInstance, req, data = 'success') =>
  debugInstance(
    `Responding ${req.path} request to ${req.headers.origin} with ${data}`
  );
