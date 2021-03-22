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

export const debugExternalApi = ddInfo;
export const debugInit = ddInfo;
export const debugCrons = ddInfo;
export const debugWorkers = ddInfo;
export const debugDb = ddInfo;
export const debugImport = ddInfo;
export const debugBase = ddInfo;
export const debugEmail = ddInfo;
export const debugError = ddError;

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
