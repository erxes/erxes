import { lazy, Suspense, type ComponentProps } from 'react';
import { cn } from 'erxes-ui/lib/utils';

// erxes-ui is one shared chunk that every route loads. Components here are fetched the first
// time one renders, because the Base UI part behind each serves only that component: Combobox
// (37 kB minified) for the multi-select, Slider (17 kB) for the slider.

const Selector = lazy(async () => ({ default: (await import('./multiselect')).MultipleSelector }));

const SliderPart = lazy(async () => ({ default: (await import('./slider')).Slider }));

export const MultipleSelector = (props: ComponentProps<typeof Selector>) => (
  <Suspense fallback={<div className={cn('min-h-7 w-full rounded shadow-xs', props.className)} />}>
    <Selector {...props} />
  </Suspense>
);

export const Slider = (props: ComponentProps<typeof SliderPart>) => (
  <Suspense fallback={<div className="h-4 w-full" />}>
    <SliderPart {...props} />
  </Suspense>
);
