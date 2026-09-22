import { Badge, Skeleton, TextOverflowTooltip } from 'erxes-ui';
import { useTagsByIds } from 'ui-modules/modules/tags-new/hooks/useTagByIds';
import { ITag } from 'ui-modules/modules/tags-new/types/Tag';
import React from 'react';
import { TagInline } from 'ui-modules/modules/tags-new/components/TagInline';

export const TagBadge = React.forwardRef<
  React.ElementRef<typeof Badge>,
  React.ComponentPropsWithoutRef<typeof Badge> & {
    tag?: ITag;
    tagId?: string;
    onCompleted?: (tags: ITag) => void;
    renderAsPlainText?: boolean;
  }
>(({ tag, tagId, onCompleted, renderAsPlainText, ...props }, ref) => {
  const { tagDetail, loading, error } = useTagsByIds({
    variables: {
      id: tagId,
    },
    skip: !!tag || !tagId,
    onCompleted: ({ tagDetail }: { tagDetail: ITag }) => {
      onCompleted?.(tagDetail);
    },
  });

  const tagValue = tag || tagDetail;

  if (loading) {
    return <Skeleton className="w-8 h-4" />;
  }

  if (!tagValue) {
    if (error && tagId) {
      if (renderAsPlainText) {
        return <TextOverflowTooltip value={tagId} />;
      }

      return (
        <Badge ref={ref} title={`Unknown id: ${tagId}`} {...props}>
          <span className="max-w-24 truncate font-mono">{tagId}</span>
        </Badge>
      );
    }

    return null;
  }

  if (renderAsPlainText) {
    return <TextOverflowTooltip value={tagValue?.name} />;
  }

  return (
    <Badge ref={ref} {...props}>
      <TagInline tag={tagValue} />
    </Badge>
  );
});
