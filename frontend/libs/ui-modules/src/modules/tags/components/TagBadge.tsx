import { Badge, Skeleton, TextOverflowTooltip } from 'erxes-ui';
import { useTagsByIds } from '../hooks/useTags';
import { ITag } from '../types/Tag';
import React from 'react';

export const TagBadge = React.forwardRef<
  React.ElementRef<typeof Badge>,
  React.ComponentPropsWithoutRef<typeof Badge> & {
    tag?: ITag;
    tagId?: string;
    renderClose?: (tag: ITag) => React.ReactNode;
    onCompleted?: (tags: ITag) => void;
    renderAsPlainText?: boolean;
  }
>(
  (
    { tag, tagId, renderClose, onCompleted, renderAsPlainText, ...props },
    ref,
  ) => {
    const { tagDetail, loading } = useTagsByIds({
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
      return null;
    }

    if (renderAsPlainText) {
      return <TextOverflowTooltip value={tagValue?.name} />;
    }

    return (
      <Badge ref={ref} {...props}>
        <TextOverflowTooltip value={tagValue?.name} />
      </Badge>
    );
  },
);
