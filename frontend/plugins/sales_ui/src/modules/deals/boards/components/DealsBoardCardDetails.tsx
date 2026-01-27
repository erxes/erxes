import { Badge, cn } from 'erxes-ui';

type DealCardDetailsProps = {
  items: any;
  color: string;
  className?: string;
};

const MAX_VISIBLE_ITEMS = 5;

const DealCardDetails = ({
  items,
  color,
  className,
  perItemSpan
}: DealCardDetailsProps & { perItemSpan: (item: any) => JSX.Element }) => {
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
            {perItemSpan(item)}
          </span>
        </div>
      ))}
      {remainingCount > 0 && (
        <Badge variant="ghost">+{remainingCount} more</Badge>
      )}
    </div>
  );
};

export const DealCardDetailsProduct = ({
  items,
  color,
  className,
}: DealCardDetailsProps) => {
  const perItemSpan = (item: any) => {
    return (
      <>
        {item.product?.name}
        {
          item.quantity && (
            <span className="text-muted-foreground/70">
              {' '}
              ({item.quantity} {item.uom || 'PC'})
            </span>
          )
        }
        {
          item.unitPrice && (
            <span className="text-muted-foreground/70">
              {' '}
              -{' '}
              {item.unitPrice.toLocaleString(undefined, {
                maximumFractionDigits: 0,
              })}
            </span>
          )
        }
      </>
    )
  }
  return (
    <DealCardDetails items={items} color={color} className={className} perItemSpan={perItemSpan} />
  )
}

export const DealCardDetailsCompany = ({ items, color, className }: DealCardDetailsProps) => {
  const perItemSpan = (item: any) => {
    return (
      <>
        {item.primaryName || item.primaryPhone || 'Undefined company'}
      </>
    )
  }
  return (
    <DealCardDetails items={items} color={color} className={className} perItemSpan={perItemSpan} />
  )
}

export const DealCardDetailsCustomer = ({ items, color, className }: DealCardDetailsProps) => {
  const perItemSpan = (item: any) => {
    return (
      <>
        {`${item.firstName ?? ''} ${item.lastName ?? ''} ${item.primaryPhone ?? item.primaryEmail ?? ''}`}
      </>
    )
  }
  return (
    <DealCardDetails items={items} color={color} className={className} perItemSpan={perItemSpan} />
  )
}

export const DealCardDetailsTag = ({ items, color, className }: DealCardDetailsProps) => {
  const perItemSpan = (item: any) => {
    return (
      <>
        {item.name}
      </>
    )
  }
  return (
    <DealCardDetails items={items} color={color} className={className} perItemSpan={perItemSpan} />
  )
}

export const DealCardDetailsProperties = ({ items, color, className }: DealCardDetailsProps) => {
  const perItemSpan = (item: any) => {
    return (
      <>
        {item.name}
      </>
    )
  }
  return (
    <DealCardDetails items={items} color={color} className={className} perItemSpan={perItemSpan} />
  )
}
