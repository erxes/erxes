import debug from 'debug';

export const debugInfo = debug(`erxes:info`);
export const debugError = debug(`erxes:error`);

export const wrapper = instance => {
  return debug(instance);
};

export const debugBase = wrapper('erxes-api');
export const debugExternalApi = wrapper('erxes-api:external-api-fetcher');
export const debugEmail = wrapper('erxes-api:email');
