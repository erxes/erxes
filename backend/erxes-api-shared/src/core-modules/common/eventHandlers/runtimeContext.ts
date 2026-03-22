import { AsyncLocalStorage } from 'async_hooks';

export type EventHandlerRuntimeContext = {
  subdomain: string;
  processId: string;
  userId: string;
};

const eventHandlerContextStorage =
  new AsyncLocalStorage<EventHandlerRuntimeContext>();

export const normalizeEventHandlerContext = (
  subdomain: string,
  context?: Record<string, any>,
): EventHandlerRuntimeContext => {
  const userId = context?.userId || context?.user?._id || '';

  return {
    subdomain,
    processId: context?.processId || '',
    userId,
  };
};

export const getEventHandlerRuntimeContext = () => {
  return eventHandlerContextStorage.getStore();
};

export const setEventHandlerRuntimeContext = (
  subdomain: string,
  context?: Record<string, any>,
) => {
  eventHandlerContextStorage.enterWith(
    normalizeEventHandlerContext(subdomain, context),
  );
};
