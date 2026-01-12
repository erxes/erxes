import { sendTRPCMessage } from 'erxes-api-shared/utils';

export const countDocuments = async (
  subdomain: string,
  type: string,
  _ids: string[],
) => {
  const [pluginName, moduleName] = type.split(':');

  const MODULE_NAMES = {
    customer: 'customers',
  };

  if (!MODULE_NAMES[moduleName]) {
    return 0;
  }

  return await sendTRPCMessage({
    subdomain,
    pluginName,
    method: 'mutation',
    module: MODULE_NAMES[moduleName] || moduleName,
    action: 'tag',
    input: {
      type,
      _ids,
      action: 'count',
    },
  });
};
