import {
  lazy,
  Suspense,
  use,
  type ComponentProps,
  type ComponentType,
  type LazyExoticComponent,
} from 'react';
import type { IMaskInput } from 'react-imask';
import { cn } from 'erxes-ui/lib/utils';
import type * as CalendarModule from './calendar';
import type { CalendarProps } from './calendar';
import type * as ResizableModule from './resizable';
import type * as SliderModule from './slider';
import type { SliderProps } from './slider';

// erxes-ui is one shared chunk that every route loads. Components here are fetched the first
// time one renders, because the library behind each serves only that component: Base UI's
// Combobox (37 kB minified) for the multi-select, its Slider (17 kB) for the slider,
// react-resizable-panels for Resizable, imask for masked inputs, and react-day-picker (21 kB
// gzipped) for the calendar.

type MaskInputProps = ComponentProps<typeof IMaskInput>;

const LoadedMaskInput: LazyExoticComponent<ComponentType<MaskInputProps>> = lazy(async () => ({
  default: (await import('react-imask')).IMaskInput,
}));

/**
 * imask's input (numbers with separators, hex colours). Until its code loads, a read-only input
 * with the same value and classes holds its place.
 */
export const MaskInput = (props: MaskInputProps) => (
  <Suspense
    fallback={
      <input
        readOnly
        aria-label={props['aria-label']}
        className={props.className}
        value={props.value ?? ''}
      />
    }
  >
    <LoadedMaskInput {...props} />
  </Suspense>
);

const Selector = lazy(async () => ({ default: (await import('./multiselect')).MultipleSelector }));

/**
 * Picks several options from a list, shown as removable badges.
 * Picked options leave the list. The code loads the first time one renders.
 */
export const MultipleSelector = (props: ComponentProps<typeof Selector>) => (
  <Suspense fallback={<div className={cn('min-h-7 w-full rounded shadow-xs', props.className)} />}>
    <Selector {...props} />
  </Suspense>
);

let calendarModule: Promise<typeof CalendarModule> | undefined;

/** Fetches the calendar's code before its first render, as the pointer or focus reaches a date field. */
export const preloadCalendar = () =>
  (calendarModule ??= import('./calendar').catch((error: unknown) => {
    // The next render tries again.
    calendarModule = undefined;
    throw error;
  }));

const LoadedCalendar = lazy(async () => ({ default: (await preloadCalendar()).Calendar }));

/**
 * A month grid to pick a day or range, in the UI's language. It has month and year selects;
 * for a field, use `DatePicker`, which puts this in a popover. Years run 1980 to ten ahead.
 */
export const Calendar = ({ className, classNames, ...props }: CalendarProps) => (
  <Suspense fallback={<div className={cn('h-75 w-62', className)} />}>
    <LoadedCalendar className={className} classNames={classNames} {...props} />
  </Suspense>
);

// Slider is generic over its value, which React.lazy would erase, so it reads the module with use().
let sliderModule: Promise<typeof SliderModule> | undefined;

const LoadedSlider = <Value extends number | readonly number[]>(props: SliderProps<Value>) => {
  const { Slider } = use((sliderModule ??= import('./slider')));

  return <Slider {...props} />;
};

/** A draggable slider for one number or a range. Its code loads on first render. */
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

/** Side-by-side panels with handles that drag their sizes. Its code loads on first render. */
export const Resizable = {
  PanelGroup: ResizablePanelGroup,
  Panel: ResizablePanel,
  Handle: ResizableHandle,
};
