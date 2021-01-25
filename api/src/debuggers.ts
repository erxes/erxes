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

export const debugExternalApi = ddLogger;
export const debugInit = ddLogger;
export const debugCrons = ddLogger;
export const debugWorkers = ddLogger;
export const debugDb = ddLogger;
export const debugImport = ddLogger;
export const debugBase = ddLogger;
export const debugEmail = ddLogger;
export const debugError = ddLogger;

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
