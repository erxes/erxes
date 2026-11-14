import { buttonVariants } from 'erxes-ui/components/button';
import { cn, mergeRefs } from 'erxes-ui/lib/utils';
import React, { useEffect, useRef } from 'react';

export const SuggestionMenu = ({
  ref,
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  children: React.ReactNode;
} & React.RefAttributes<HTMLDivElement>) => (
  <div
    ref={ref}
    {...props}
    className={cn(
      'erxes-suggestion-menu w-60 rounded-md bg-background shadow-md border border/50 p-1 outline-hidden overflow-hidden',
      className,
    )}
  >
    <div className="overflow-auto flex flex-col gap-px h-full">{children}</div>
  </div>
);

// The editor keeps focus: items are picked with the arrow keys there, or by mouse here.
export const SuggestionMenuItem = ({
  ref,
  isSelected,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  isSelected: boolean;
} & React.RefAttributes<HTMLButtonElement>) => {
  const itemRef = useRef<HTMLButtonElement>(null);
  const mounted = useRef(false);

  // Keyboard selection scrolls the item into view; the first render leaves the scroll alone.
  useEffect(() => {
    if (mounted.current && isSelected) {
      itemRef.current?.scrollIntoView({ block: 'nearest' });
    }

    mounted.current = true;
  }, [isSelected]);

  return (
    <button
      ref={mergeRefs(itemRef, ref)}
      type="button"
      aria-pressed={isSelected}
      tabIndex={-1}
      {...props}
      onMouseDown={(e) => {
        e.preventDefault();
        props.onMouseDown?.(e);
      }}
      className={cn(
        buttonVariants({ variant: 'ghost' }),
        'justify-between rounded px-2 text-[13px] font-medium [&>svg]:size-4 hover:bg-muted/60',
        isSelected && 'bg-muted',
        props.className,
      )}
    />
  );
};
