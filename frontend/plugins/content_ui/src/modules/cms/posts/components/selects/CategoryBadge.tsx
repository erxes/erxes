import { Badge, Skeleton, TextOverflowTooltip } from 'erxes-ui';

import { ICategory } from './types/category';
import React from 'react';
import { useCategoryById } from './hooks/useCategoryById';

export const CategoryBadge = React.forwardRef<
  React.ElementRef<typeof Badge>,
  React.ComponentPropsWithoutRef<typeof Badge> & {
    category?: ICategory;
    categoryId?: string;
    renderClose?: (category: ICategory) => React.ReactNode;
    onCompleted?: (category: ICategory) => void;
    renderAsPlainText?: boolean;
  }
>(
  (
    {
      category,
      categoryId,
      renderClose,
      onCompleted,
      renderAsPlainText,
      ...props
    },
    ref,
  ) => {
    const { categoryDetail, loading } = useCategoryById({
      variables: {
        id: categoryId,
      },
      skip: !!category || !categoryId,
      onCompleted: ({ categoryDetail }: { categoryDetail: ICategory }) => {
        onCompleted?.(categoryDetail);
      },
    });

    const categoryValue = category || categoryDetail;

    if (loading) {
      return <Skeleton className="w-8 h-4" />;
    }

    if (!categoryValue) {
      return null;
    }

    if (renderAsPlainText) {
      return <TextOverflowTooltip value={categoryValue?.title} />;
    }

    return (
      <Badge ref={ref} {...props}>
        <TextOverflowTooltip value={categoryValue?.title} />
      </Badge>
    );
  },
);
