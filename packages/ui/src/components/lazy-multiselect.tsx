import { lazy, Suspense, type ComponentProps } from 'react';
import { cn } from 'erxes-ui/lib/utils';

const Selector = lazy(async () => ({ default: (await import('./multiselect')).MultipleSelector }));

/**
 * The multi-select, fetched the first time one renders. erxes-ui is one shared chunk that every
 * route loads, and Base UI's Combobox, which only this needs, is 37 kB of it minified.
 */
export const MultipleSelector = (props: ComponentProps<typeof Selector>) => (
  <Suspense fallback={<div className={cn('min-h-7 w-full rounded shadow-xs', props.className)} />}>
    <Selector {...props} />
  </Suspense>
);
