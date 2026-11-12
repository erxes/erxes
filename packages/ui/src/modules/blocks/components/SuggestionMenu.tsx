import { buttonVariants } from 'erxes-ui/components/button';
import { cn } from 'erxes-ui/lib/utils';
import React, { useEffect, useRef, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import { mergeRefs } from 'react-merge-refs';

export const SuggestionMenu = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { children: React.ReactNode }
>(({ children, className, ...props }, ref) => (
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
));

export const SuggestionMenuItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { isSelected: boolean }
>(({ isSelected, ...props }, ref) => {
  const [isMounted, setIsMounted] = useState(false);
  const { ref: inViewRef, inView } = useInView();
  const itemRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsMounted(true);

    if (isSelected && !inView && isMounted) {
      itemRef.current?.scrollIntoView({
        block: 'nearest',
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSelected]);

  return (
    <div
      ref={mergeRefs([itemRef, inViewRef, ref])}
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
});
