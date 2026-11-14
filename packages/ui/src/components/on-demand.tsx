import { lazy, Suspense, use, type ComponentProps } from 'react';
import { cn } from 'erxes-ui/lib/utils';
import type * as SliderModule from './slider';
import type { SliderProps } from './slider';

// erxes-ui is one shared chunk that every route loads. Components here are fetched the first
// time one renders, because the Base UI part behind each serves only that component: Combobox
// (37 kB minified) for the multi-select, Slider (17 kB) for the slider.

const Selector = lazy(async () => ({ default: (await import('./multiselect')).MultipleSelector }));

export const MultipleSelector = (props: ComponentProps<typeof Selector>) => (
  <Suspense fallback={<div className={cn('min-h-7 w-full rounded shadow-xs', props.className)} />}>
    <Selector {...props} />
  </Suspense>
);

// Slider is generic over its value, which React.lazy would erase, so it reads the module with use().
let sliderModule: Promise<typeof SliderModule> | undefined;

const LoadedSlider = <Value extends number | readonly number[]>(props: SliderProps<Value>) => {
  const { Slider } = use((sliderModule ??= import('./slider')));

  return <Slider {...props} />;
};

export const Slider = <Value extends number | readonly number[]>(props: SliderProps<Value>) => (
  <Suspense fallback={<div className="h-4 w-full" />}>
    <LoadedSlider {...props} />
  </Suspense>
);
