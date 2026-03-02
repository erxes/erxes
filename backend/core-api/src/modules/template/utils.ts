import { sendTRPCMessage } from 'erxes-api-shared/utils';

export const getRelatedContents = async (input: any, subdomain: any) => {
  const { contentType } = input || {};

  const [pluginName, moduleName] = (contentType || '').split(':');

  if (!pluginName || !moduleName) {
    return [];
  }

  try {
    return await sendTRPCMessage({
      subdomain,

      pluginName,
      method: 'query',
      module: moduleName,
      action: 'getRelatedContent',
      input,
      defaultValue: [],
    });
  } catch (error) {
    return [];
  }
};
