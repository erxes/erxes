import * as React from 'react';
import { createContext, useContext } from 'react';
import { Slot } from 'radix-ui';
import { cn } from 'erxes-ui/lib';
import { IconCheck, IconLoader2 } from '@tabler/icons-react';

type StepperContextValue = {
  activeStep: number;
  setActiveStep: (step: number) => void;
  orientation: 'horizontal' | 'vertical';
};

type StepItemContextValue = {
  step: number;
  state: StepState;
  isDisabled: boolean;
  isLoading: boolean;
};

type StepState = 'active' | 'completed' | 'inactive' | 'loading';

const StepperContext = createContext<StepperContextValue | undefined>(
  undefined,
);
const StepItemContext = createContext<StepItemContextValue | undefined>(
  undefined,
);

const useStepper = () => {
  const context = useContext(StepperContext);
  if (!context) {
    throw new Error('useStepper must be used within a Stepper');
  }
  return context;
};

const useStepItem = () => {
  const context = useContext(StepItemContext);
  if (!context) {
    throw new Error('useStepItem must be used within a StepperItem');
  }
  return context;
};

interface StepperProps extends React.HTMLAttributes<HTMLDivElement> {
  defaultValue?: number;
  value?: number;
  onValueChange?: (value: number) => void;
  orientation?: 'horizontal' | 'vertical';
}

const StepperRoot = React.forwardRef<HTMLDivElement, StepperProps>(
  (
    {
      defaultValue = 0,
      value,
      onValueChange,
      orientation = 'horizontal',
      className,
      ...props
    },
    ref,
  ) => {
    const [activeStep, setInternalStep] = React.useState(defaultValue);

    const setActiveStep = React.useCallback(
      (step: number) => {
        if (value === undefined) {
          setInternalStep(step);
        }
        onValueChange?.(step);
      },
      [value, onValueChange],
    );

    const currentStep = value ?? activeStep;

    return (
      <StepperContext.Provider
        value={{
          activeStep: currentStep,
          setActiveStep,
          orientation,
        }}
      >
        <div
          ref={ref}
          data-slot="stepper"
          className={cn(
            'group/stepper inline-flex data-[orientation=horizontal]:w-full data-[orientation=horizontal]:flex-row data-[orientation=vertical]:flex-col',
            className,
          )}
          data-orientation={orientation}
          {...props}
        />
      </StepperContext.Provider>
    );
  },
);
StepperRoot.displayName = 'Stepper';

interface StepperItemProps extends React.HTMLAttributes<HTMLDivElement> {
  step: number;
  completed?: boolean;
  disabled?: boolean;
  loading?: boolean;
}

const StepperItem = React.forwardRef<HTMLDivElement, StepperItemProps>(
  (
    {
      step,
      completed = false,
      disabled = false,
      loading = false,
      className,
      children,
      ...props
    },
    ref,
  ) => {
    const { activeStep } = useStepper();

    const state: StepState =
      completed || step < activeStep
        ? 'completed'
        : activeStep === step
        ? 'active'
        : 'inactive';

    const isLoading = loading && step === activeStep;

    return (
      <StepItemContext.Provider
        value={{ step, state, isDisabled: disabled, isLoading }}
      >
        <div
          ref={ref}
          data-slot="stepper-item"
          className={cn(
            'group/step flex items-center group-data-[orientation=horizontal]/stepper:flex-row group-data-[orientation=vertical]/stepper:flex-col',
            className,
          )}
          data-state={state}
          {...(isLoading ? { 'data-loading': true } : {})}
          {...props}
        >
          {children}
        </div>
      </StepItemContext.Provider>
    );
  },
);
StepperItem.displayName = 'StepperItem';

interface StepperTriggerProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
}

const StepperTrigger = React.forwardRef<HTMLButtonElement, StepperTriggerProps>(
  ({ asChild = false, className, children, ...props }, ref) => {
    const { setActiveStep } = useStepper();
    const { step, isDisabled } = useStepItem();

    if (asChild) {
      const Comp = asChild ? Slot.Root : 'span';
      return (
        <Comp data-slot="stepper-trigger" className={className}>
          {children}
        </Comp>
      );
    }

    return (
      <button
        ref={ref}
        data-slot="stepper-trigger"
        className={cn(
          'focus-visible:border-ring focus-visible:ring-ring/50 inline-flex items-center gap-3 rounded-full outline-none focus-visible:z-10 focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50',
          className,
        )}
        onClick={() => setActiveStep(step)}
        disabled={isDisabled}
        {...props}
      >
        {children}
      </button>
    );
  },
);
StepperTrigger.displayName = 'StepperTrigger';

interface StepperIndicatorProps extends React.HTMLAttributes<HTMLDivElement> {
  asChild?: boolean;
}

const StepperIndicator = React.forwardRef<
  HTMLDivElement,
  StepperIndicatorProps
>(({ asChild = false, className, children, ...props }, ref) => {
  const { state, step, isLoading } = useStepItem();

  return (
    <span
      ref={ref}
      data-slot="stepper-indicator"
      className={cn(
        'bg-muted text-muted-foreground data-[state=active]:bg-primary data-[state=completed]:bg-primary data-[state=active]:text-primary-foreground data-[state=completed]:text-primary-foreground relative flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-medium',
        className,
      )}
      data-state={state}
      {...props}
    >
      {asChild ? (
        children
      ) : (
        <>
          <span className="transition-all group-data-loading/step:scale-0 group-data-loading/step:opacity-0 group-data-loading/step:transition-none group-data-[state=completed]/step:scale-0 group-data-[state=completed]/step:opacity-0">
            {step}
          </span>
          <IconCheck
            className="absolute scale-0 opacity-0 transition-all group-data-[state=completed]/step:scale-100 group-data-[state=completed]/step:opacity-100"
            size={16}
            aria-hidden="true"
          />
          {isLoading && (
            <span className="absolute transition-all">
              <IconLoader2
                className="animate-spin"
                size={14}
                aria-hidden="true"
              />
            </span>
          )}
        </>
      )}
    </span>
  );
});
StepperIndicator.displayName = 'StepperIndicator';

const StepperTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => {
  const { state } = useStepItem();

  return (
    <h3
      ref={ref}
      data-slot="stepper-title"
      className={cn(
        'text-sm font-medium data-[state=active]:text-primary data-[state=completed]:text-primary',
        className,
      )}
      data-state={state}
      {...props}
    />
  );
});
StepperTitle.displayName = 'StepperTitle';

const StepperDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => {
  return (
    <p
      ref={ref}
      data-slot="stepper-description"
      className={cn('text-muted-foreground text-sm', className)}
      {...props}
    />
  );
});
StepperDescription.displayName = 'StepperDescription';

const StepperSeparator = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      data-slot="stepper-separator"
      className={cn(
        'bg-muted group-data-[state=completed]/step:bg-primary m-0.5 group-data-[orientation=horizontal]/stepper:h-0.5 group-data-[orientation=horizontal]/stepper:w-full group-data-[orientation=horizontal]/stepper:flex-1 group-data-[orientation=vertical]/stepper:h-12 group-data-[orientation=vertical]/stepper:w-0.5',
        className,
      )}
      {...props}
    />
  );
});
StepperSeparator.displayName = 'StepperSeparator';

export const Stepper = Object.assign(StepperRoot, {
  Item: StepperItem,
  Trigger: StepperTrigger,
  Indicator: StepperIndicator,
  Title: StepperTitle,
  Description: StepperDescription,
  Separator: StepperSeparator,
});
