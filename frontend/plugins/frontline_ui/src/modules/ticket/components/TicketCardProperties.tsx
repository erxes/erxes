import { Badge, Tooltip } from 'erxes-ui';
import {
  formatFieldValue,
  hasFieldValue,
  useFields,
  useGetTags,
  type IField,
} from 'ui-modules';

const MAX_VISIBLE_TAGS = 5;
const MAX_VISIBLE_PROPERTIES = 3;
const TAG_COLOR = '#FF6600';
const PROPERTY_COLOR = '#0EA5E9';

type CardDetailItem = {
  _id: string;
  name: string;
  colorCode?: string;
};

const getPropertyItems = (
  fields: IField[],
  propertiesData?: Record<string, unknown>,
): CardDetailItem[] =>
  fields
    .filter((field) => hasFieldValue(propertiesData?.[field._id]))
    .slice(0, MAX_VISIBLE_PROPERTIES)
    .map((field) => ({
      _id: field._id,
      name: `${field.name}: ${formatFieldValue(
        field,
        propertiesData?.[field._id],
      )}`,
    }));

const TooltipItemList = ({ items }: { items: string[] }) => (
  <div className="flex max-w-64 flex-col gap-1">
    {items.map((item, index) => (
      <span key={`${item}-${index}`} className="wrap-break-word">
        {item}
      </span>
    ))}
  </div>
);

const DetailBadges = ({
  items,
  color,
  maxVisibleItems,
}: {
  items: CardDetailItem[];
  color: string;
  maxVisibleItems: number;
}) => {
  if (!items.length) {
    return null;
  }

  const visibleItems = items.slice(0, maxVisibleItems);
  const remainingCount = items.length - visibleItems.length;
  const remainingItems = items.slice(maxVisibleItems).map((item) => item.name);

  return (
    <div className="flex flex-wrap gap-1">
      {visibleItems.map((item) => (
        <Tooltip key={item._id} delayDuration={200}>
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
      {remainingCount > 0 && (
        <Tooltip delayDuration={200}>
          <Tooltip.Trigger asChild>
            <Badge
              variant="ghost"
              className="h-5 cursor-default px-1.5 hover:bg-muted"
            >
              +{remainingCount}
            </Badge>
          </Tooltip.Trigger>
          <Tooltip.Content>
            <TooltipItemList items={remainingItems} />
          </Tooltip.Content>
        </Tooltip>
      )}
    </div>
  );
};

type TicketCardDetailsProps = {
  tagIds: string[];
  propertiesData?: Record<string, unknown>;
};

export const TicketCardDetails = ({
  tagIds,
  propertiesData,
}: TicketCardDetailsProps) => {
  const { fields } = useFields({ contentType: 'frontline:ticket' });
  const { tags } = useGetTags({ variables: { type: 'frontline:ticket' } });

  const selectedTags = tagIds
    .map((tagId) => tags?.find((tag) => tag._id === tagId))
    .filter((tag): tag is NonNullable<typeof tag> => Boolean(tag));

  const propertyItems = getPropertyItems(fields || [], propertiesData);

  if (!selectedTags.length && !propertyItems.length) {
    return null;
  }

  return (
    <Tooltip.Provider>
      <div className="mt-1 flex flex-col gap-1 p-3 pt-0">
        <DetailBadges
          items={selectedTags}
          color={TAG_COLOR}
          maxVisibleItems={MAX_VISIBLE_TAGS}
        />
        <DetailBadges
          items={propertyItems}
          color={PROPERTY_COLOR}
          maxVisibleItems={MAX_VISIBLE_PROPERTIES}
        />
      </div>
    </Tooltip.Provider>
  );
};
