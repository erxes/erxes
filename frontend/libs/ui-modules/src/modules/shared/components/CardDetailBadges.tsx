import { Badge, Button, Tooltip } from 'erxes-ui';

export type CardDetailBadgeItem = {
  _id?: string;
  name: string;
  colorCode?: string;
};

type CardDetailBadgesProps = {
  items: CardDetailBadgeItem[];
  color: string;
  maxVisibleItems: number;
  onOverflowClick?: () => void;
};

const TooltipItemList = ({ items }: { items: string[] }) => (
  <div className="flex max-w-64 flex-col gap-1">
    {items.map((item, index) => (
      <span key={`${item}-${index}`} className="wrap-break-word">
        {item}
      </span>
    ))}
  </div>
);

export const CardDetailBadges = ({
  items,
  color,
  maxVisibleItems,
  onOverflowClick,
}: CardDetailBadgesProps) => {
  if (!items.length) {
    return null;
  }

  const visibleItems = items.slice(0, maxVisibleItems);
  const remainingItems = items.slice(maxVisibleItems);

  return (
    <Tooltip.Provider>
      <div className="flex flex-wrap gap-1">
        {visibleItems.map((item, index) => (
          <Tooltip
            key={`${item._id ?? item.name}-${index}`}
            delayDuration={200}
          >
            <Tooltip.Trigger asChild>
              <Badge
                variant="secondary"
                className="h-5 max-w-full cursor-default px-1.5 font-normal"
              >
                <span
                  className="size-1.5 shrink-0 rounded-full"
                  style={{ backgroundColor: item.colorCode || color }}
                />
                <span className="truncate">{item.name}</span>
              </Badge>
            </Tooltip.Trigger>
            <Tooltip.Content>{item.name}</Tooltip.Content>
          </Tooltip>
        ))}
        {remainingItems.length > 0 && (
          <Tooltip delayDuration={200}>
            <Tooltip.Trigger asChild>
              {onOverflowClick ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-5 px-1.5 text-xs"
                  onClick={(event) => {
                    event.stopPropagation();
                    onOverflowClick();
                  }}
                >
                  +{remainingItems.length}
                </Button>
              ) : (
                <Badge
                  variant="ghost"
                  className="h-5 cursor-default px-1.5 hover:bg-muted"
                >
                  +{remainingItems.length}
                </Badge>
              )}
            </Tooltip.Trigger>
            <Tooltip.Content>
              <TooltipItemList
                items={remainingItems.map((item) => item.name)}
              />
            </Tooltip.Content>
          </Tooltip>
        )}
      </div>
    </Tooltip.Provider>
  );
};
