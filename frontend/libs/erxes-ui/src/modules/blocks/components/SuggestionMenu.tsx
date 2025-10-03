import { buttonVariants } from 'erxes-ui/components';
import { cn } from 'erxes-ui/lib';
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
      'w-72 rounded-md bg-background shadow-md border border/50 p-2 outline-none overflow-hidden',
      className,
    )}
  >
    <div className="overflow-auto flex flex-col gap-1 h-full">{children}</div>
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
      className={cn(
        buttonVariants({ variant: 'ghost', size: 'lg' }),
        'justify-between p-2 font-medium [&>svg]:size-4 hover:bg-transparent',
        isSelected && 'bg-muted',
        props.className,
      )}
    />
  );
});
