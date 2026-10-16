import { Separator, cn } from 'erxes-ui';

import type { ReactNode } from 'react';

export const NavigationActivitySection = ({
  children,
  expanded,
  label,
}: Readonly<{
  children: ReactNode;
  expanded: boolean;
  label: string;
}>) => {
  return (
    <section className="w-full shrink-0">
      <div className="relative h-8 w-full shrink-0">
        <div
          className={cn(
            'absolute inset-0 flex w-full items-center gap-2 overflow-hidden whitespace-nowrap px-2 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground transition-opacity duration-100 ease-linear motion-reduce:transition-none',
            expanded
              ? 'delay-100 opacity-100'
              : 'pointer-events-none delay-0 opacity-0',
          )}
        >
          <span className="truncate">{label}</span>
        </div>
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
      <div className="flex flex-col gap-1">{children}</div>
    </section>
  );
};
