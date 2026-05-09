import * as React from 'react';
import { cn } from 'erxes-ui';

export type HeadingLevel = 1 | 2 | 3 | 4;

const sizeMap: Record<HeadingLevel, string> = {
  1: 'text-3xl font-bold tracking-tight',
  2: 'text-2xl font-semibold tracking-tight',
  3: 'text-xl font-semibold',
  4: 'text-base font-semibold',
};

export type HeadingProps = React.HTMLAttributes<HTMLHeadingElement> & {
  level?: HeadingLevel;
};

export const Heading = React.forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ className, level = 2, ...props }, ref) => {
    const Tag = `h${level}` as 'h1' | 'h2' | 'h3' | 'h4';
    return (
      <Tag
        ref={ref}
        className={cn(sizeMap[level], 'text-foreground', className)}
        {...props}
      />
    );
  },
);
Heading.displayName = 'Heading';
