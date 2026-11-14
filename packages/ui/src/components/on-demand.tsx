import { lazy, Suspense, use, type ComponentProps } from 'react';
import { cn } from 'erxes-ui/lib/utils';
import type * as ResizableModule from './resizable';
import type * as SliderModule from './slider';
import type { SliderProps } from './slider';

// erxes-ui is one shared chunk that every route loads. Components here are fetched the first
// time one renders, because the library behind each serves only that component: Base UI's
// Combobox (37 kB minified) for the multi-select, its Slider (17 kB) for the slider, and
// react-resizable-panels for Resizable.

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

// The group suspends until the module loads; its panels and handles render inside it, so by
// then use() reads the settled promise without suspending again.
let resizableModule: Promise<typeof ResizableModule> | undefined;

const useResizable = () => use((resizableModule ??= import('./resizable'))).Resizable;

type Parts = typeof ResizableModule.Resizable;

const LoadedPanelGroup = (props: ComponentProps<Parts['PanelGroup']>) => {
  const { PanelGroup } = useResizable();

  return <PanelGroup {...props} />;
};

const ResizablePanelGroup = (props: ComponentProps<Parts['PanelGroup']>) => (
  <Suspense fallback={<div className={cn('size-full', props.className)} />}>
    <LoadedPanelGroup {...props} />
  </Suspense>
);

const ResizablePanel = (props: ComponentProps<Parts['Panel']>) => {
  const { Panel } = useResizable();

  return <Panel {...props} />;
};

const ResizableHandle = (props: ComponentProps<Parts['Handle']>) => {
  const { Handle } = useResizable();

  return <Handle {...props} />;
};

export const Resizable = {
  PanelGroup: ResizablePanelGroup,
  Panel: ResizablePanel,
  Handle: ResizableHandle,
};
