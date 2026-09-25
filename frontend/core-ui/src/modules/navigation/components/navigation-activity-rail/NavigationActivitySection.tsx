import { IconCaretRightFilled } from '@tabler/icons-react';
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
        className="group/navigation-section"
        open={!expanded || open}
        onOpenChange={setOpen}
      >
        <div className="relative h-6 w-full shrink-0">
          <Collapsible.Trigger
            className={cn(
              'absolute inset-0 flex w-full items-center gap-2 overflow-hidden whitespace-nowrap rounded-md px-2 text-left font-sans text-xs font-semibold text-accent-foreground transition-opacity duration-100 ease-linear hover:bg-accent motion-reduce:transition-none',
              expanded
                ? 'delay-100 opacity-100'
                : 'pointer-events-none delay-0 opacity-0',
            )}
            disabled={!expanded}
            tabIndex={expanded ? 0 : -1}
          >
            <IconCaretRightFilled className="size-3.5 shrink-0 transition-transform group-data-[state=open]/navigation-section:rotate-90" />
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
        <Collapsible.Content className="flex flex-col gap-1">
          {children}
        </Collapsible.Content>
      </Collapsible>
    </section>
  );
};
