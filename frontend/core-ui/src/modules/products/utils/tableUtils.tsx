import { CSSProperties } from 'react';

import { Column } from '@tanstack/react-table';

import { cn } from 'erxes-ui';

import { Product } from './makeData';

export const getCommonPinningStyles = (
  column: Column<Product>,
): CSSProperties => {
  const isPinned = column.getIsPinned();
  const isLastLeftPinnedColumn =
    isPinned === 'left' && column.getIsLastColumn('left');
  const isFirstRightPinnedColumn =
    isPinned === 'right' && column.getIsFirstColumn('right');

  return {
    boxShadow: isLastLeftPinnedColumn
      ? '-4px 0 4px -4px hsl(var(--muted-foreground)) inset'
      : isFirstRightPinnedColumn
      ? '4px 0 4px -4px hsl(var(--muted-foreground)) inset'
      : undefined,
    left: isPinned === 'left' ? `${column.getStart('left')}px` : undefined,
    right: isPinned === 'right' ? `${column.getAfter('right')}px` : undefined,
    width: column.getSize(),
  };
};

export const getCommonPinningClassName = (column: Column<Product>) => {
  const isPinned = column.getIsPinned();

  return cn(isPinned ? 'sticky z-[1]' : 'relative');
};
