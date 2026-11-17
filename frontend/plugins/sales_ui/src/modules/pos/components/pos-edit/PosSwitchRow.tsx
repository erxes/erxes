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
}) => (
  <div className={cn('divide-y rounded-lg border bg-background', className)}>
    {children}
  </div>
);

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
        <Form.Item className="flex items-center justify-between gap-4 space-y-0 p-4">
          <div className="space-y-1">
            <Form.Label variant="peer" className="text-sm font-medium">
              {label}
            </Form.Label>
            {description && <Form.Description>{description}</Form.Description>}
          </div>
          <Form.Control>
            <Switch checked={!!field.value} onCheckedChange={field.onChange} />
          </Form.Control>
        </Form.Item>
        {!!field.value && children && (
          <div className="space-y-4 border-t bg-muted/30 p-4 animate-in fade-in-0 slide-in-from-top-1 duration-200">
            {children}
          </div>
        )}
      </div>
    )}
  />
);
