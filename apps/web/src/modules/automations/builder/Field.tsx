import { IconInfoCircle } from '@tabler/icons-react';
import { Button, cn, Tooltip } from 'erxes-ui';
import type { ReactNode } from 'react';
import { FieldLabel } from './FieldLabel';

export const InfoTip = ({ text }: { text: string }) => (
  <Tooltip.Provider delay={150}>
    <Tooltip>
      <Tooltip.Trigger
        render={
          <Button variant="ghost" size="icon" tone="muted" className="size-4" aria-label={text} />
        }
      >
        <IconInfoCircle />
      </Tooltip.Trigger>
      <Tooltip.Content className="max-w-64 whitespace-normal">{text}</Tooltip.Content>
    </Tooltip>
  </Tooltip.Provider>
);

export const Field = ({
  label,
  required,
  info,
  invalid,
  children,
}: {
  label: string;
  required?: boolean;
  info?: string | null;
  invalid?: boolean;
  children: ReactNode;
}) => (
  <div className="space-y-1.5">
    <div className="flex items-center gap-1">
      <FieldLabel>
        {label}
        {required && <span className="text-destructive-text"> *</span>}
      </FieldLabel>
      {info && <InfoTip text={info} />}
    </div>
    <div className={cn('space-y-1.5', invalid && 'rounded-sm ring-1 ring-destructive')}>
      {children}
    </div>
  </div>
);
