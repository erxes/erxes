import tracer from 'dd-trace';
import * as formats from 'dd-trace/ext/formats';

export const ddLogger = message => {
  const span = tracer.scope().active();
  const time = new Date().toISOString();

  const record = { time, level: 'info', message };

  if (span) {
    tracer.inject(span.context(), formats.LOG, record);
  }

  console.log(JSON.stringify(record));
};

export const debugInit = ddLogger;
export const debugDb = ddLogger;
export const debugCrons = ddLogger;
export const debugBase = ddLogger;
export const debugIntegrations = ddLogger;
export const debugFacebook = ddLogger;
export const debugTwitter = ddLogger;
export const debugGmail = ddLogger;
export const debugCallPro = ddLogger;
export const debugChatfuel = ddLogger;
export const debugNylas = ddLogger;
export const debugWhatsapp = ddLogger;
export const debugExternalRequests = ddLogger;
export const debugDaily = ddLogger;
export const debugSmooch = ddLogger;
export const debugProductBoard = ddLogger;
export const debugTelnyx = ddLogger;

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
