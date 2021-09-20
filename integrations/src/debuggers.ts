import tracer from 'dd-trace';
import * as formats from 'dd-trace/ext/formats';

export const ddLogger = (message, level) => {
  const span = tracer.scope().active();
  const time = new Date().toISOString();

  const record = { time, level, message };

  if (span) {
    tracer.inject(span.context(), formats.LOG, record);
  }

  console.log(JSON.stringify(record));
};

export const ddInfo = message => {
  return ddLogger(message, 'info');
};

export const ddError = message => {
  return ddLogger(message, 'error');
};

export const debugInit = ddInfo;
export const debugDb = ddInfo;
export const debugCrons = ddInfo;
export const debugBase = ddInfo;
export const debugIntegrations = ddInfo;
export const debugFacebook = ddInfo;
export const debugTwitter = ddInfo;
export const debugGmail = ddInfo;
export const debugCallPro = ddInfo;
export const debugChatfuel = ddInfo;
export const debugNylas = ddInfo;
export const debugWhatsapp = ddInfo;
export const debugExternalRequests = ddInfo;
export const debugDaily = ddInfo;
export const debugSmooch = ddInfo;
export const debugTelnyx = ddInfo;
export const debugError = ddError;

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
