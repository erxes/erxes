import { Badge, cn, renderFullName } from 'erxes-ui';

type DealCardDetailsProps = {
  items: any;
  color: string;
  className?: string;
  separated?: boolean;
};

const MAX_VISIBLE_ITEMS = 5;

export const DealCardDetails = ({
  items,
  color,
  className,
  separated,
}: DealCardDetailsProps) => {
  if (!items || items.length === 0) return null;

  const visibleItems = items.slice(0, MAX_VISIBLE_ITEMS);
  const remainingCount = items.length - MAX_VISIBLE_ITEMS;

  return (
    <div
      className={cn(
        'flex flex-col',
        separated ? 'gap-1.5' : 'gap-0.5',
        className,
      )}
    >
      {visibleItems.map((item: any, index: number) => (
        <div
          key={item._id || index}
          className={cn(
            'flex min-w-0 items-start gap-1 text-xs text-muted-foreground',
            separated &&
              'rounded-md border border-border bg-background/80 px-2 py-1.5 text-foreground shadow-xs dark:border-border/80 dark:bg-muted/70',
          )}
        >
          <span
            className="w-1 h-3 rounded-full shrink-0"
            style={{ backgroundColor: item.colorCode || color }}
          />
          <span className="min-w-0">
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
