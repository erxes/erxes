import React from 'react';
import { type LegendPayload } from 'recharts';
import { cn } from 'erxes-ui';

interface CustomLegendContentProps {
  payload?: Array<{
    value: string;
    color: string;
    dataKey?: string;
    payload?: unknown;
  }>;
  verticalAlign?: string;
  onMouseEnter?: (data: LegendPayload) => void;
  onMouseLeave?: () => void;
}

export const CustomLegendContent = (props: CustomLegendContentProps) => {
  const {
    payload,
    verticalAlign = 'bottom',
    onMouseEnter,
    onMouseLeave,
  } = props;

  if (!payload?.length) {
    return null;
  }

  return (
    <div
      className={cn(
        'flex items-center flex-wrap justify-center gap-4',
        verticalAlign === 'top' ? 'pb-3' : 'pt-3',
      )}
      onMouseLeave={onMouseLeave}
    >
      {payload.map((item) => {
        const handleMouseEnter = () => {
          if (onMouseEnter) {
            const payload = item as LegendPayload;
            onMouseEnter(payload);
          }
        };

        return (
          <div
            key={item.value}
            className={cn(
              'flex items-center gap-1.5 [&>svg]:h-3 [&>svg]:w-3 [&>svg]:text-muted-foreground cursor-pointer',
            )}
            onMouseEnter={handleMouseEnter}
          >
            <div
              className="h-2 w-2 shrink-0 rounded-[2px]"
              style={{
                backgroundColor: item.color,
              }}
            />
            {item.value}
          </div>
        );
      })}
    </div>
  );
};
