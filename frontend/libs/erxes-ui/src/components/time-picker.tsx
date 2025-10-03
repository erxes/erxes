import {
  composeRenderProps,
  DateFieldProps,
  DateField as DateFieldRac,
  DateInputProps as DateInputPropsRac,
  DateInput as DateInputRac,
  DateSegmentProps,
  DateSegment as DateSegmentRac,
  DateValue as DateValueRac,
  TimeFieldProps,
  TimeField as TimeFieldRac,
  TimeValue as TimeValueRac,
} from 'react-aria-components';

import { cn } from 'erxes-ui/lib';

function DateField<T extends DateValueRac>({
  className,
  children,
  ...props
}: DateFieldProps<T>) {
  return (
    <DateFieldRac
      className={composeRenderProps(className, (className) => cn(className))}
      {...props}
    >
      {children}
    </DateFieldRac>
  );
}

function TimeField<T extends TimeValueRac>({
  className,
  children,
  ...props
}: TimeFieldProps<T>) {
  return (
    <TimeFieldRac
      className={composeRenderProps(className, (className) => cn(className))}
      {...props}
    >
      {children}
    </TimeFieldRac>
  );
}

function DateSegment({ className, ...props }: DateSegmentProps) {
  return (
    <DateSegmentRac
      className={composeRenderProps(className, (className) =>
        cn(
          'text-foreground data-[focused=true]:bg-primary data-[invalid=true]:data-[focused=true]:bg-destructive data-[focused=true]:data-[placeholder=true]:text-primary-foreground data-[focused=true]:text-primary-foreground data-[invalid=true]:data-[placeholder=true]:text-destructive data-[invalid=true]:text-destructive data-[placeholder=true]:text-accent-foreground data-[type=literal]:text-accent-foreground inline rounded p-0.5 caret-transparent outline-hidden data-[disabled=true]:cursor-not-allowed data-[disabled=true]:opacity-50 data-[invalid=true]:data-[focused=true]:text-primary-foreground data-[type=literal]:px-0 data-[focused=true]:outline-none',
          className,
        ),
      )}
      {...props}
      data-invalid
    />
  );
}

interface DateInputProps extends DateInputPropsRac {
  className?: string;
  unstyled?: boolean;
}

function DateInput({
  className,
  unstyled = false,
  ...props
}: Omit<DateInputProps, 'children'>) {
  return (
    <DateInputRac
      className={composeRenderProps(className, (className) =>
        cn(
          !unstyled &&
            'relative inline-flex h-7 w-full items-center overflow-hidden whitespace-nowrap rounded bg-background px-2 py-2 text-sm shadow-xs transition-[color,box-shadow] outline-none data-[focus-within=true]:shadow-focus data-[focus-within=true]:has-aria-invalid:shadow-destructive',
          className,
        ),
      )}
      {...props}
    >
      {(segment) => <DateSegment segment={segment} />}
    </DateInputRac>
  );
}

export { DateField, DateInput, DateSegment, TimeField };
export type { DateInputProps };
