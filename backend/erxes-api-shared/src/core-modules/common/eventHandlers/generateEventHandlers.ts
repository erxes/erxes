import { createEventHandlers } from './createEventHandlers';
import { ScopedEventHandlers } from './types';

type HandlerRuntimeContext = {
  subdomain: string;
  processId: string;
  userId: string;
};

const normalizeContext = (
  subdomain: string,
  context?: Record<string, any>,
): HandlerRuntimeContext => {
  const userId = context?.userId || context?.user?._id || '';

  return {
    subdomain,
    processId: context?.processId || '',
    userId,
  };
};

export const createScopedEventHandlers: (
  subdomain: string,
  initialContext?: Record<string, any>,
) => ScopedEventHandlers =
  (subdomain: string, initialContext?: Record<string, any>) =>
  (pluginName: string) =>
  (moduleName: string, collectionName: string) => {
    const runtimeContext = normalizeContext(subdomain, initialContext);

    return createEventHandlers({
      subdomain,
      pluginName,
      moduleName,
      collectionName,
      getContext: () => runtimeContext,
    });
  };

export const generateEventHandlersFromRequest = createScopedEventHandlers;
