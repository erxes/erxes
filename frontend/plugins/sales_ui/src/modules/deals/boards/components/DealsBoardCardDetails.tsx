import { Badge, cn, renderFullName } from 'erxes-ui';

type DealCardDetailsProps = {
  items: any;
  color: string;
  className?: string;
};

const MAX_VISIBLE_ITEMS = 5;

export const DealCardDetails = ({
  items,
  color,
  className,
}: DealCardDetailsProps) => {
  if (!items || items.length === 0) return null;

  const visibleItems = items.slice(0, MAX_VISIBLE_ITEMS);
  const remainingCount = items.length - MAX_VISIBLE_ITEMS;

  return (
    <div className={cn('flex flex-col gap-0.5', className)}>
      {visibleItems.map((item: any, index: number) => (
        <div
          key={index}
          className="flex items-start gap-1 text-xs text-muted-foreground"
        >
          <span
            className="w-1 h-3 rounded-full shrink-0"
            style={{ backgroundColor: color }}
          />
          <span>
            {item.product?.name ||
              item.name ||
              item.primaryName ||
              renderFullName(item)}
            {item.quantity && (
              <span className="text-muted-foreground/70">
                {' '}
                ({item.quantity} {item.uom || 'PC'})
              </span>
            )}
            {item.unitPrice && (
              <span className="text-muted-foreground/70">
                {' '}
                -{' '}
                {item.unitPrice.toLocaleString(undefined, {
                  maximumFractionDigits: 0,
                })}
              </span>
            )}
          </span>
        </div>
      ))}
      {remainingCount > 0 && (
        <Badge variant="ghost">+{remainingCount} more</Badge>
      )}
    </div>
  );
};

export default DealCardDetails;
