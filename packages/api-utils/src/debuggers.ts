import tracer from 'dd-trace';
import * as formats from 'dd-trace/ext/formats';
import debug from 'debug';

export const ddLogger = (message) => {
  const span = tracer.scope().active();
  const time = new Date().toISOString();

  const record = { time, level: 'info', message };

  if (span) {
    tracer.inject(span.context(), formats.LOG, record);
  }

  console.log(JSON.stringify(record));
};

export const wrapper = (instance) => {
  if (!process.env.DD_SERVICE) {
    return debug(instance);
  }

  return ddLogger;
};

export const debugBase = wrapper('erxes-api');
export const debugExternalApi = wrapper('erxes-api:external-api-fetcher');
export const debugEmail = wrapper('erxes-api:email');
