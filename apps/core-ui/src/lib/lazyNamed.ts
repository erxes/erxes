import { type ComponentType, lazy } from 'react';

/**
 * `React.lazy` for a named export: the module is fetched the first time the
 * component renders, inside the nearest `Suspense`.
 */
export const lazyNamed = <K extends string, P extends object>(
  load: () => Promise<Record<K, ComponentType<P>>>,
  name: K,
) => lazy(async () => ({ default: (await load())[name] }));
