import { createEventHandlers } from './createEventHandlers';
import { ScopedEventHandlers } from './types';
import {
  getEventHandlerRuntimeContext,
  normalizeEventHandlerContext,
} from './runtimeContext';

export const createScopedEventHandlers: (
  subdomain: string,
  initialContext?: Record<string, any>,
) => ScopedEventHandlers =
  (subdomain: string, initialContext?: Record<string, any>) =>
  (pluginName: string) =>
  (moduleName: string, collectionName: string) => {
    const fallbackContext = normalizeEventHandlerContext(
      subdomain,
      initialContext,
    );

    return createEventHandlers({
      subdomain,
      pluginName,
      moduleName,
      collectionName,
      getContext: () => {
        const runtimeContext = getEventHandlerRuntimeContext();

        if (runtimeContext?.subdomain === subdomain) {
          return runtimeContext;
        }

        return fallbackContext;
      },
    });
  };

export const generateEventHandlersFromRequest = createScopedEventHandlers;
