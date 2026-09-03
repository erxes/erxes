import { Badge, Skeleton, TextOverflowTooltip, cn } from 'erxes-ui';
import { useGetTags } from 'ui-modules';

const MAX_VISIBLE_TAGS = 2;

export const ConversationTagChips = ({
  tagIds,
  showAll,
  onRemove,
}: {
  tagIds: string[];
  showAll?: boolean;
  onRemove?: (tagId: string) => void;
}) => {
  const { tags, loading } = useGetTags({
    variables: { type: 'frontline:conversation' },
  });

  if (loading) {
    return tagIds.map((tagId) => <Skeleton key={tagId} className="w-8 h-4" />);
  }

  const selectedTags = tagIds
    .map((tagId) => tags?.find((tag) => tag._id === tagId))
    .filter((tag): tag is NonNullable<typeof tag> => Boolean(tag));

  if (!selectedTags.length) {
    return null;
  }

  const visibleTags = showAll
    ? selectedTags
    : selectedTags.slice(0, MAX_VISIBLE_TAGS);
  const overflowCount = selectedTags.length - visibleTags.length;

  return (
    <div
      className={cn(
        showAll
          ? 'flex flex-wrap gap-2 w-full'
          : 'flex items-center gap-1 min-w-0',
      )}
    >
      {visibleTags.map((tag) => (
        <Badge
          key={tag._id}
          variant="secondary"
          className={cn(!showAll && 'max-w-24 shrink truncate')}
          onClose={onRemove ? () => onRemove(tag._id) : undefined}
        >
          <span
            className="size-1.5 shrink-0 rounded-full"
            style={{ backgroundColor: tag.colorCode }}
          />
          <TextOverflowTooltip value={tag.name} />
        </Badge>
      ))}
      {overflowCount > 0 && (
        <Badge variant="secondary" className="shrink-0 text-xs">
          +{overflowCount}
        </Badge>
      )}
    </div>
  );
};
