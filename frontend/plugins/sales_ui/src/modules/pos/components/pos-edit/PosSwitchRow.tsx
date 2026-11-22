import { cn, Form, Switch } from 'erxes-ui';
import { type ReactNode } from 'react';
import {
  type Control,
  type FieldPathByValue,
  type FieldValues,
} from 'react-hook-form';

interface PosSwitchRowProps<T extends FieldValues> {
  control: Control<T>;
  name: FieldPathByValue<T, boolean>;
  label: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
}

export const PosSwitchList = ({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) => <div className={cn('flex flex-col gap-0.5', className)}>{children}</div>;

export const PosSwitchRow = <T extends FieldValues>({
  control,
  name,
  label,
  description,
  children,
}: PosSwitchRowProps<T>) => (
  <Form.Field
    control={control}
    name={name}
    render={({ field }) => (
      <div>
        <Form.Item className="flex items-center justify-between gap-4 space-y-0 rounded-md px-2 py-2 hover:bg-accent/50">
          <div className="min-w-0 space-y-0.5">
            <Form.Label variant="peer" className="text-xs font-medium">
              {label}
            </Form.Label>
            {description && <Form.Description>{description}</Form.Description>}
          </div>
          <Form.Control>
            <Switch checked={!!field.value} onCheckedChange={field.onChange} />
          </Form.Control>
        </Form.Item>
        {!!field.value && children && (
          <div className="mx-2 mb-2 space-y-3 rounded-md bg-muted/50 p-3 animate-in fade-in-0 slide-in-from-top-1 duration-200">
            {children}
          </div>
        )}
      </div>
    )}
  />
);
