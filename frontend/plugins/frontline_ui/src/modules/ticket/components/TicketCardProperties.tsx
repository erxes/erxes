import { Badge, Tooltip } from 'erxes-ui';
import { useFields, useGetTags, type IField } from 'ui-modules';

const MAX_VISIBLE_DETAILS = 5;

const hasFieldValue = (value: unknown) => {
  if (value === null || value === undefined || value === '') return false;
  if (Array.isArray(value) && value.length === 0) return false;
  return true;
};

const formatFieldValue = (field: IField, value: unknown): string => {
  if (Array.isArray(value)) {
    if (field.options?.length) {
      return value
        .map(
          (item) =>
            field.options?.find((option) => option.value === item)?.label ??
            String(item),
        )
        .join(', ');
    }
    return value.join(', ');
  }
  if (field.options?.length) {
    return (
      field.options.find((option) => option.value === value)?.label ??
      String(value)
    );
  }
  if (field.type === 'boolean' || field.type === 'check') {
    return value ? 'Yes' : 'No';
  }
  if (field.type === 'date') {
    const date = new Date(value as string);
    return Number.isNaN(date.getTime())
      ? String(value)
      : date.toLocaleDateString();
  }
  return String(value);
};

type CardDetailItem = {
  _id: string;
  name: string;
  colorCode?: string;
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

const CardDetails = ({
  items,
  color,
}: {
  items: CardDetailItem[];
  color: string;
}) => {
  if (!items.length) {
    return null;
  }

  const visibleItems = items.slice(0, MAX_VISIBLE_DETAILS);
  const remainingCount = items.length - visibleItems.length;

  return (
    <Tooltip.Provider>
      <div className="flex flex-wrap gap-1">
        {visibleItems.map((item, index) => (
          <Tooltip key={`${item._id}-${index}`} delayDuration={200}>
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
              <TooltipItemList
                items={items
                  .slice(MAX_VISIBLE_DETAILS)
                  .map((item) => item.name)}
              />
            </Tooltip.Content>
          </Tooltip>
        )}
      </div>
    </Tooltip.Provider>
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

  const propertyItems = (fields || [])
    .filter(
      (field) =>
        field.isVisibleInCard && hasFieldValue(propertiesData?.[field._id]),
    )
    .map((field) => ({
      _id: field._id,
      name: `${field.name}: ${formatFieldValue(
        field,
        propertiesData?.[field._id],
      )}`,
    }));

  if (!selectedTags.length && !propertyItems.length) {
    return null;
  }

  return (
    <div className="flex flex-col gap-1 p-3 pt-0">
      <div className="mt-1 flex flex-col gap-1">
        <CardDetails items={selectedTags} color="#FF6600" />
        <CardDetails items={propertyItems} color="#0EA5E9" />
      </div>
    </div>
  );
};
