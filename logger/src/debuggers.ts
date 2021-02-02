import tracer from 'dd-trace';
import * as formats from 'dd-trace/ext/formats';
import * as dotenv from 'dotenv';

export const ddLogger = message => {
  const span = tracer.scope().active();
  const time = new Date().toISOString();

  const record = { time, level: 'info', message };

  if (span) {
    tracer.inject(span.context(), formats.LOG, record);
  }

  console.log(JSON.stringify(record));
};

dotenv.config();

export const debugInit = ddLogger;
export const debugDb = ddLogger;
export const debugBase = ddLogger;
export const debugExternalRequests = ddLogger;

export const debugRequest = (debugInstance, req) =>
  debugInstance(`
        Receiving ${req.path} request from ${req.headers.origin}
        body: ${JSON.stringify(req.body || {})}
        queryParams: ${JSON.stringify(req.query)}
    `);
