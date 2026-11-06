import { IconChevronDown } from '@tabler/icons-react';
import { Button, cn, Collapsible } from 'erxes-ui';
import type { ReactNode } from 'react';

/** Separates contact fields, tags, and linked records into foldable sections. */
export const ContactDetailSection = ({
  title,
  children,
  nested = false,
}: {
  title: string;
  children: ReactNode;
  nested?: boolean;
}) => (
  <Collapsible
    defaultOpen
    className={cn(!nested && 'border-b last:border-b-0', nested && 'py-1')}
  >
    <h3>
      <Collapsible.Trigger asChild>
        <Button
          variant="ghost"
          className={cn(
            'group/section w-full justify-between rounded-none text-xs',
            nested
              ? 'h-8 px-1 font-normal text-muted-foreground'
              : 'h-10 px-3 font-medium',
          )}
        >
          {title}
          <IconChevronDown className="size-3.5 text-muted-foreground transition-transform group-data-[state=closed]/section:-rotate-90" />
        </Button>
      </Collapsible.Trigger>
    </h3>
    <Collapsible.Content className={cn('min-w-0 pb-3', !nested && 'px-3')}>
      <div className="flex min-w-0 flex-col gap-1">{children}</div>
    </Collapsible.Content>
  </Collapsible>
);
