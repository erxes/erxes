import { Combobox, cn } from 'erxes-ui';
import { IconChevronDown } from '@tabler/icons-react';

export const DealChipTrigger = ({
  label,
  children,
  className,
}: {
  label?: string;
  children: React.ReactNode;
  className?: string;
}) => (
  <Combobox.TriggerBase
    className={cn(
      'group w-fit max-w-sm h-7 rounded p-0 gap-0 overflow-hidden',
      'data-[state=open]:border-primary/40',
      className,
    )}
  >
    {label && (
      <span className="flex h-full shrink-0 items-center whitespace-nowrap px-3 text-muted-foreground bg-muted/40 border-r">
        {label}
      </span>
    )}
    <span className="flex min-w-0 items-center gap-1.5 pl-3 pr-2.5 font-medium text-foreground">
      <span className="flex min-w-0 items-center gap-1.5 overflow-hidden whitespace-nowrap [&_svg]:size-4 [&_svg]:shrink-0">
        {children}
      </span>
      <IconChevronDown className="size-3.5 shrink-0 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
    </span>
  </Combobox.TriggerBase>
);
