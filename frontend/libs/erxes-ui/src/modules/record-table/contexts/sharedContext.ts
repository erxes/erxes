import { createContext, type Context } from 'react';

const registry = globalThis as typeof globalThis & {
  __erxesUiContexts?: Map<string, Context<unknown>>;
};
const contexts = (registry.__erxesUiContexts ??= new Map());

/**
 * One context for every copy of erxes-ui in the page. A remote that imports
 * `erxes-ui/components` bundles its own copy, whose own `createContext` would
 * never see the provider the shared copy rendered.
 */
export const createSharedContext = <T>(
  key: string,
  defaultValue: T,
): Context<T> => {
  const existing = contexts.get(key);

  if (existing) {
    return existing as Context<T>;
  }

  const context = createContext(defaultValue);
  contexts.set(key, context as Context<unknown>);
  return context;
};
