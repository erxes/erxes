import { Badge, Tooltip } from 'erxes-ui';
import { useGetTags } from 'ui-modules';

const MAX_VISIBLE_TAGS = 3;

export const ConversationTagChips = ({
  tagIds,
  max = MAX_VISIBLE_TAGS,
  onRemove,
}: {
  tagIds: string[];
  max?: number;
  onRemove?: (tagId: string) => void;
}) => {
  const { tags } = useGetTags({
    variables: { type: 'frontline:conversation' },
  });

  const selectedTags = tagIds
    .map((tagId) => tags?.find((tag) => tag._id === tagId))
    .filter((tag): tag is NonNullable<typeof tag> => Boolean(tag));

  if (!selectedTags.length) {
    return null;
  }

  const visibleTags = selectedTags.slice(0, max);
  const remainingCount = selectedTags.length - visibleTags.length;

  return (
    <Tooltip.Provider>
      <div className="flex items-center gap-1 min-w-0">
        {visibleTags.map((tag) => (
          <Tooltip key={tag._id} delayDuration={200}>
            <Tooltip.Trigger asChild>
              <Badge
                variant="secondary"
                className="h-5 max-w-32 px-1.5 font-normal"
                onClose={onRemove ? () => onRemove(tag._id) : undefined}
              >
                <span
                  className="size-1.5 shrink-0 rounded-full"
                  style={{ backgroundColor: tag.colorCode }}
                />
                <span className="truncate">{tag.name}</span>
              </Badge>
            </Tooltip.Trigger>
            <Tooltip.Content>{tag.name}</Tooltip.Content>
          </Tooltip>
        ))}
        {remainingCount > 0 && (
          <Tooltip delayDuration={200}>
            <Tooltip.Trigger asChild>
              <Badge
                variant="secondary"
                className="h-5 shrink-0 px-1.5 font-normal"
              >
                +{remainingCount}
              </Badge>
            </Tooltip.Trigger>
            <Tooltip.Content>
              {selectedTags
                .slice(max)
                .map((tag) => tag.name)
                .join(', ')}
            </Tooltip.Content>
          </Tooltip>
        )}
      </div>
    </Tooltip.Provider>
  );
};