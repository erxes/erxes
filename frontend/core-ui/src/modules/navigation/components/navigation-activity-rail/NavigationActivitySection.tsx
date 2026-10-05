import { IconChevronRight } from '@tabler/icons-react';
import { cn, Collapsible, Separator } from 'erxes-ui';
import type { ReactNode } from 'react';
import { useState } from 'react';

export const NavigationActivitySection = ({
  children,
  expanded,
  label,
}: Readonly<{
  children: ReactNode;
  expanded: boolean;
  label: string;
}>) => {
  const [open, setOpen] = useState(true);

  return (
    <section className="w-full shrink-0">
      <Collapsible
        className="group/navigation-rail-section"
        open={!expanded || open}
        onOpenChange={setOpen}
      >
        <div className="relative h-6 w-full shrink-0">
          <Collapsible.Trigger
            className={cn(
              'absolute inset-0 flex w-full items-center gap-2 overflow-hidden whitespace-nowrap rounded-lg px-2 text-left font-sans text-[11px] font-semibold uppercase tracking-wider text-muted-foreground transition-opacity duration-100 ease-linear hover:bg-accent motion-reduce:transition-none',
              expanded
                ? 'delay-100 opacity-100'
                : 'pointer-events-none delay-0 opacity-0',
            )}
            disabled={!expanded}
            tabIndex={expanded ? 0 : -1}
          >
            <span className="flex shrink-0 transition-transform duration-250 ease-[cubic-bezier(0.22,1,0.36,1)] group-data-[state=open]/navigation-rail-section:rotate-90 motion-reduce:transition-none">
              <IconChevronRight className="size-3.5" />
            </span>
            <span className="truncate">{label}</span>
          </Collapsible.Trigger>
          <div
            aria-hidden
            className={cn(
              'absolute inset-y-0 left-0 flex w-full items-center justify-center transition-[opacity,transform] duration-100 ease-linear motion-reduce:transition-none',
              expanded
                ? 'pointer-events-none delay-0 scale-x-75 opacity-0'
                : 'delay-100 scale-x-100 opacity-100',
            )}
          >
            <Separator className="w-8" />
          </div>
        </div>
        <Collapsible.Content className="flex flex-col gap-1 pt-1">
          {children}
        </Collapsible.Content>
      </Collapsible>
    </section>
  );
};
