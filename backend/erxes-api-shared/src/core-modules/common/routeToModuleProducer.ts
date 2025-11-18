import { TAutomationProducers } from '../automations/types';
import { TAutomationProducersInput } from '../automations/zodTypes';
import { TSegmentProducers } from '../segments/types';
import { TActivityLogProducers, TAfterProcessProducers } from '../logs/types';
import { TSegmentProducersInput } from '../segments/zodSchemas';
import { TActivityLogProducersInput } from '../logs/zodSchemas';

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
  activityLog: {
    [K in TActivityLogProducers]: TActivityLogProducersInput[K];
  };
};

type CoreModuleProducerHandlerOptions<
  TModuleName extends keyof TModuleProducerInputMap,
  TProducerName extends keyof TModuleProducerInputMap[TModuleName],
> = {
  moduleName: TModuleName;
  modules: Record<string, any>;
  methodName: TProducerName;
  extractModuleName: (
    input: TModuleProducerInputMap[TModuleName][TProducerName],
  ) => string | undefined;
  generateModels: (subdomain: string) => Promise<any>;
  requiresContext?: boolean;
  errorHandler?: (
    error: Error | string,
    moduleName?: string,
  ) => { data: null; status: 'error' } | any;
};

export type TCoreModuleProducerContext<IModels = any> = {
  models: IModels;
  subdomain: string;
};

export function createCoreModuleProducerHandler<
  TModuleName extends keyof TModuleProducerInputMap,
  TProducerName extends keyof TModuleProducerInputMap[TModuleName],
>(options: CoreModuleProducerHandlerOptions<TModuleName, TProducerName>) {
  const {
    moduleName: _coreModuleName,
    modules,
    methodName,
    extractModuleName,
    generateModels,
    errorHandler,
  } = options;

  type ModuleKeys = keyof typeof modules;
  type TInput = TModuleProducerInputMap[TModuleName][TProducerName];

  return async ({ subdomain, data }: { subdomain: string; data: TInput }) => {
    const moduleName = extractModuleName(data) as ModuleKeys;

    if (!moduleName || !modules[moduleName]) {
      if (errorHandler) {
        return errorHandler(
          `Module not found: ${String(moduleName)}`,
          String(moduleName),
        );
      }
      throw new Error(`Module not found: ${String(moduleName)}`);
    }

    const models = await generateModels(subdomain);
    const context: TCoreModuleProducerContext = { models, subdomain };

    const moduleHandler = modules[moduleName];
    if (!moduleHandler || typeof moduleHandler[methodName] !== 'function') {
      if (errorHandler) {
        return errorHandler(
          `Method ${String(methodName)} not found in module ${String(
            moduleName,
          )}`,
          String(moduleName),
        );
      }
      throw new Error(
        `Method ${String(methodName)} not found in module ${String(
          moduleName,
        )}`,
      );
    }

    return moduleHandler[methodName](data, context);
  };
}
