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
export const debugBase = ddInfo;
export const debugEngages = ddInfo;
export const debugError = ddError;

export const debugRequest = (debugInstance, req) =>
  debugInstance(`
        Receiving ${req.path} request from ${req.headers.origin}
        body: ${JSON.stringify(req.body || {})}
        queryParams: ${JSON.stringify(req.query)}
    `);
