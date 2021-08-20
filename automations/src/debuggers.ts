import * as debug from 'debug';

export const debugInit = debug('erxes-automations:init');
export const debugDb = debug('erxes-automations:db');
export const debugBase = debug('erxes-automations:base');
export const debugAutomations = debug('erxes-automations:automations');
export const debugError = debug('erxes-automations:error');

export const debugRequest = (debugInstance, req) =>
  debugInstance(`
        Receiving ${req.path} request from ${req.headers.origin}
        body: ${JSON.stringify(req.body || {})}
        queryParams: ${JSON.stringify(req.query)}
    `);
