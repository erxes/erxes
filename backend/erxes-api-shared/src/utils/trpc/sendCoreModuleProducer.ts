import { getPlugin, isEnabled } from '../../utils/service-discovery';
import {
  createTRPCUntypedClient,
  httpBatchLink,
  TRPCRequestOptions,
} from '@trpc/client';

type TCoreModuleProducer = {
  moduleName: 'automations' | 'segments' | 'afterProcess';
  producerName: string;
  method?: 'query' | 'mutation';
  pluginName: string;
  input: any;
  defaultValue?: any;
  options?: TRPCRequestOptions;
};

export const sendCoreModuleProducer = async ({
  moduleName,
  pluginName,
  method = 'mutation',
  producerName,
  input,
  defaultValue,
  options,
}: TCoreModuleProducer): Promise<any> => {
  if (pluginName && !(await isEnabled(pluginName))) {
    return defaultValue;
  }

  const pluginInfo = await getPlugin(pluginName);

  const client = createTRPCUntypedClient({
    links: [httpBatchLink({ url: `${pluginInfo.address}/${moduleName}` })],
  });

  const result = await client[method](`${producerName}`, input, options);

  return result || defaultValue;
};
