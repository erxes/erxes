import React, { forwardRef } from 'react';

export interface Props {
  children: React.ReactNode;
  columns?: number;
  style?: React.CSSProperties;
  horizontal?: boolean;
}

export const List = forwardRef<HTMLUListElement, Props>(
  ({ children, columns = 1, horizontal, style }: Props, ref) => {
    return (
      <ul
        ref={ref}
        style={
          {
            ...style,
            '--columns': columns,
          } as React.CSSProperties
        }
        className={`
          grid 
          auto-rows-max 
          box-border 
          gap-[10px] 
          w-full
          rounded-md 
          min-h-[200px] 
          transition-colors 
          duration-300 
          ease-in-out 
          [grid-template-columns:repeat(var(--columns,1),minmax(0,1fr))]
          after:content-[''] after:h-[10px] after:[grid-column-start:span_var(--columns,1)]
          ${horizontal ? 'w-full grid-flow-col' : ''}
        `}
      >
        {children}
      </ul>
    );
  },
);
