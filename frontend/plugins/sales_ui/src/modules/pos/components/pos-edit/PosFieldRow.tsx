import { type Icon, IconForms } from '@tabler/icons-react';
import { cn, Form } from 'erxes-ui';
import { type ReactNode } from 'react';

export const POS_VALUE_OFFSET_CLASS_NAME = 'pl-[calc(9rem+1.25rem)]';

interface PosPanelRowProps {
  label: ReactNode;
  icon?: Icon;
  required?: boolean;
  children: ReactNode;
}

interface PosFieldRowProps extends PosPanelRowProps {
  description?: ReactNode;
  after?: ReactNode;
  asControl?: boolean;
}

export const PosFieldList = ({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) => <div className={cn('flex flex-col gap-0.5', className)}>{children}</div>;

export const PosPanelRow = ({
  label,
  icon: RowIcon = IconForms,
  required,
  children,
}: PosPanelRowProps) => (
  <div className="grid min-h-8 grid-cols-[9rem_minmax(0,1fr)] items-center gap-x-3 px-2">
    <span
      className="flex min-w-0 items-center gap-2 text-xs text-muted-foreground"
      title={typeof label === 'string' ? label : undefined}
    >
      <RowIcon className="size-3.5 shrink-0" aria-hidden="true" />
      <span className="truncate">
        {label}
        {required && <span className="text-destructive"> *</span>}
      </span>
    </span>
    <div className="min-w-0 text-xs [&_button:not([role=switch])]:h-7 [&_button:not([role=switch])]:text-xs">
      {children}
    </div>
  </div>
);

export const PosFieldRow = ({
  label,
  icon,
  required,
  description,
  after,
  asControl = true,
  children,
}: PosFieldRowProps) => (
  <Form.Item className="space-y-0.5">
    <PosPanelRow label={label} icon={icon} required={required}>
      {asControl ? <Form.Control>{children}</Form.Control> : children}
    </PosPanelRow>
    {description && (
      <Form.Description className={cn(POS_VALUE_OFFSET_CLASS_NAME, 'text-xs')}>
        {description}
      </Form.Description>
    )}
    {after && <div className={POS_VALUE_OFFSET_CLASS_NAME}>{after}</div>}
    <Form.Message className={cn(POS_VALUE_OFFSET_CLASS_NAME, 'text-xs')} />
  </Form.Item>
);
