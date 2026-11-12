import type { ContentType } from '@erxes/core-contract';
import { Badge, cn } from 'erxes-ui';
import { useTags } from './useTags';

export const TagDot = ({ color, className }: { color?: string | null; className?: string }) => (
  <span
    aria-hidden
    className={cn('inline-block size-2 shrink-0 rounded-full bg-muted-foreground', className)}
    style={color ? { backgroundColor: color } : undefined}
  />
);

/** A record's tags as coloured badges (unknown ids are skipped). */
export const TagBadges = ({
  type,
  ids,
  max,
  placeholder,
}: {
  type: ContentType;
  ids: string[];
  max?: number;
  placeholder?: string;
}) => {
  const { byId } = useTags(type);

  const tags = ids.flatMap((id) => {
    const tag = byId.get(id);

    return tag ? [tag] : [];
  });

  const visible = max === undefined ? tags : tags.slice(0, max);

  if (!tags.length) {
    return placeholder ? <span className="text-muted-foreground">{placeholder}</span> : null;
  }

  return (
    <span className="flex min-w-0 items-center gap-1 overflow-hidden">
      {visible.map((tag) => (
        <Badge key={tag.id} variant="secondary" className="shrink-0 gap-1.5">
          <TagDot color={tag.colorCode} />
          {tag.name}
        </Badge>
      ))}
      {tags.length > visible.length && (
        <Badge variant="secondary" className="shrink-0">
          +{tags.length - visible.length}
        </Badge>
      )}
    </span>
  );
};
