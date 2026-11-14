import { createCn } from 'cn/engine';
import type { Ref, RefCallback } from 'react';
import tables from './cn-tables';

/**
 * Joins classes and drops the ones a later class overrides. The merge tables include the
 * scales theme.css and styles.css declare in `@theme`, so `cn('shadow-sm', 'shadow-focus')`
 * keeps only the last; `pnpm check:generated` fails when they are older than the theme.
 */
export const cn = createCn(tables);

/** One ref callback that sets every given ref, for an element both the component and its caller need. */
export const mergeRefs =
  <T>(...refs: (Ref<T> | undefined)[]): RefCallback<T> =>
  (node) => {
    for (const ref of refs) {
      if (typeof ref === 'function') ref(node);
      else if (ref) ref.current = node;
    }
  };
