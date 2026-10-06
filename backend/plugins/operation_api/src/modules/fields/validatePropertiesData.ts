import { sendTRPCMessage } from 'erxes-api-shared/utils';

export const validatePropertiesData = async (
  subdomain: string,
  propertiesData: Record<string, unknown>,
) => {
  return await sendTRPCMessage({
    subdomain,
    pluginName: 'core',
    method: 'mutation',
    module: 'fields',
    action: 'validateFieldValues',
    input: { data: propertiesData },
    defaultValue: propertiesData,
  });
};
