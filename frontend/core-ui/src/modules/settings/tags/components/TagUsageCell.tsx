import { TagsListCell } from '@/settings/tags/components/TagsListCell';
import { ITag } from 'ui-modules';

export const TagUsageCell = ({ tag }: { tag: ITag }) => {
  if (tag.isGroup) {
    return <div className="w-24 max-sm:hidden" />;
  }

  const count = tag.objectCount ?? 0;

  return (
    <TagsListCell className="w-24 max-sm:hidden justify-end pr-2">
      {count > 0 ? (
        <span className="text-xs text-muted-foreground font-medium tabular-nums">
          {count}
        </span>
      ) : (
        <span className="text-xs text-muted-foreground/40 font-medium">—</span>
      )}
    </TagsListCell>
  );
};
