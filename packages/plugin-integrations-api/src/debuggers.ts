import * as debug from 'debug';

export const debugInit = debug('erxes-integrations:init');
export const debugDb = debug('erxes-integrations:db');
export const debugCrons = debug('erxes-integrations-crons:');
export const debugBase = debug('erxes-integrations:base');
export const debugIntegrations = debug('erxes-integrations:integrations');
export const debugFacebook = debug('erxes-integrations:facebook');
export const debugTwitter = debug('erxes-integrations:twitter');
export const debugGmail = debug('erxes-integrations:gmail');
export const debugCallPro = debug('erxes-integrations:callpro');
export const debugChatfuel = debug('erxes-integrations:chatfuel');
export const debugNylas = debug('erxes-integrations:nylas');
export const debugWhatsapp = debug('erxes-integrations:whatsapp');
export const debugExternalRequests = debug(
  'erxes-integrations:external-requests'
);
export const debugDaily = debug('erxes-integrations:daily');
export const debugSmooch = debug('erxes-integrations:smooch');
export const debugTelnyx = debug('erxes-integrations:telnyx');
export const debugError = debug('erxes-integrations:error');

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
