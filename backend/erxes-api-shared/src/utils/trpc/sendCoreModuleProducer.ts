import { getPlugin, isEnabled } from '../../utils/service-discovery';
import {
  createTRPCUntypedClient,
  httpBatchLink,
  TRPCRequestOptions,
} from '@trpc/client';
import { TAutomationProducers } from '../../core-modules/automations/types';
import { TAutomationProducersInput } from '../../core-modules/automations/zodTypes';
import { TSegmentProducers } from '../../core-modules/segments/types';
import { TAfterProcessProducers } from '../../core-modules/logs/types';
import { TSegmentProducersInput } from '../../core-modules/segments/zodSchemas';

type TModuleProducerInputMap = {
  automations: {
    [K in TAutomationProducers]: TAutomationProducersInput[K];
  };
  segments: {
    [K in TSegmentProducers]: TSegmentProducersInput[K];
  };
  afterProcess: {
    [K in TAfterProcessProducers]: any;
  };
};

type TCoreModuleProducer<
  TModuleName extends keyof TModuleProducerInputMap = keyof TModuleProducerInputMap,
  TProducerName extends keyof TModuleProducerInputMap[TModuleName] = keyof TModuleProducerInputMap[TModuleName],
> = {
  subdomain: string;
  moduleName: TModuleName;
  producerName: TProducerName;
  method?: 'query' | 'mutation';
  pluginName: string;
  input: TModuleProducerInputMap[TModuleName][TProducerName];
  defaultValue?: any;
  options?: TRPCRequestOptions;
};

export const sendCoreModuleProducer = async <
  TModuleName extends keyof TModuleProducerInputMap = keyof TModuleProducerInputMap,
  TProducerName extends keyof TModuleProducerInputMap[TModuleName] = keyof TModuleProducerInputMap[TModuleName],
>({
  subdomain,
  moduleName,
  pluginName,
  method = 'mutation',
  producerName,
  input,
  defaultValue,
  options,
}: TCoreModuleProducer<TModuleName, TProducerName>): Promise<any> => {
  if (pluginName && !(await isEnabled(pluginName))) {
    return defaultValue;
  }

  const pluginInfo = await getPlugin(pluginName);

  // Validate plugin address before constructing URL
  if (!pluginInfo.address || pluginInfo.address.trim() === '') {
    console.warn(
      `Plugin "${pluginName}" address is not available. Returning defaultValue.`,
    );
    return defaultValue;
  }

  const baseUrl = `${pluginInfo.address}/${moduleName}`;

  try {
    const client = createTRPCUntypedClient({
      links: [httpBatchLink({ url: baseUrl })],
    });

    const result = await client[method](
      String(producerName),
      { subdomain, data: input ?? {} },
      options,
    );

    return result || defaultValue;
  } catch (error: any) {
    const errorMessage = error?.message || 'Unknown error';
    const errorCode = error?.cause?.code || error?.code;

    if (errorCode === 'ECONNREFUSED') {
      console.warn(
        `[TRPC] Connection refused to plugin "${pluginName}" at ${baseUrl}. ` +
          `The plugin service may not be running or is not accessible. ` +
          `Returning defaultValue.`,
      );
    } else {
      console.warn(
        `[TRPC] Error calling plugin "${pluginName}" at ${baseUrl}: ${errorMessage}. ` +
          `Returning defaultValue.`,
      );
    }

    return defaultValue;
  }
};
