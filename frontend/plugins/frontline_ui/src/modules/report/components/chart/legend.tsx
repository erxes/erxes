import { useRef } from 'react';
import { type DefaultLegendContentProps, type LegendPayload } from 'recharts';
import { cn } from 'erxes-ui';

type CustomLegendContentProps = Pick<
  DefaultLegendContentProps,
  'payload' | 'verticalAlign' | 'onMouseEnter' | 'onMouseLeave'
>;

export const CustomLegendContent = (props: CustomLegendContentProps) => {
  const {
    payload,
    verticalAlign = 'bottom',
    onMouseEnter,
    onMouseLeave,
  } = props;
  const hovered = useRef<{ item: LegendPayload; index: number } | null>(null);

  if (!payload?.length) {
    return null;
  }

  return (
    <div
      className={cn(
        'flex items-center flex-wrap justify-center gap-4',
        verticalAlign === 'top' ? 'pb-3' : 'pt-3',
      )}
      onMouseLeave={(event) => {
        const last = hovered.current;
        hovered.current = null;

        if (last && onMouseLeave) {
          onMouseLeave(last.item, last.index, event);
        }
      }}
    >
      {payload.map((item, index) => (
        <div
          key={item.value}
          className={cn(
            'flex items-center gap-1.5 [&>svg]:h-3 [&>svg]:w-3 [&>svg]:text-muted-foreground cursor-pointer',
          )}
          onMouseEnter={(event) => {
            hovered.current = { item, index };

            if (onMouseEnter) {
              onMouseEnter(item, index, event);
            }
          }}
        >
          <div
            className="h-2 w-2 shrink-0 rounded-[2px]"
            style={{
              backgroundColor: item.color,
            }}
          />
          {item.value}
        </div>
      ))}
    </div>
  );
};
