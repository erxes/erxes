import { IconCaretDownFilled } from '@tabler/icons-react';
import type { ButtonProps } from 'erxes-ui/components/button';
import { Button } from 'erxes-ui/components/button';
import { cn } from 'erxes-ui/lib/utils';
import { fixOrder } from 'erxes-ui/utils/fixOrder';
import React, { useState, type ReactNode } from 'react';
import type { TreeCollapse } from 'erxes-ui/lib/tree-collapse';
import { RecordTableTreeContext } from '../contexts/RecordTableTreeContext';
import { useRecordTableTree } from '../hooks/useRecordTableTree';
import { readRow } from '../utils/rowFields';
import { RecordTableRow } from './RecordTableRow';

/** Rows ordered as a tree; `length` is the row count, and collapsed rows open when it changes. */
const RecordTableTreeProvider = ({
  children,
  ordered,
  length,
}: {
  children: ReactNode;
  ordered?: boolean;
  length?: number;
}) => {
  const [collapse, setCollapse] = useState<TreeCollapse>({ rowCount: length, orders: [] });

  return (
    <RecordTableTreeContext.Provider value={{ ordered, length, collapse, setCollapse }}>
      {children}
    </RecordTableTreeContext.Provider>
  );
};

const RecordTableTreeIndentation = ({ order, name }: { order: string; name: string }) => {
  const fixedOrder = fixOrder({ order, name });
  const { ordered } = useRecordTableTree(fixedOrder);
  const level = fixedOrder?.split('/').length ?? 1;

  if (level <= 1 || !ordered) {
    return null;
  }

  // One spacer per ancestor; the depth is the identity of each spacer.
  const depths = [...Array(level - 1).keys()];

  return (
    <div className="flex h-full px-3.5 gap-8">
      {depths.map((depth) => (
        <div key={depth} />
      ))}
    </div>
  );
};

const RecordTableTreeRow = React.forwardRef<
  HTMLTableRowElement,
  React.ComponentProps<typeof RecordTableRow>
>(({ original, ...props }, ref) => {
  const { ordered, isHiddenByParent } = useRecordTableTree(readRow(original).order);

  if (ordered && isHiddenByParent) {
    return null;
  }

  return <RecordTableRow ref={ref} {...props} />;
});

RecordTableTreeRow.displayName = 'RecordTableTreeRow';

const RecordTableTreeArrow = React.forwardRef<
  HTMLButtonElement,
  ButtonProps & { order: string; hasChildren: boolean }
>(({ order, hasChildren, className }, ref) => {
  const { toggleHideChildren, isHidden } = useRecordTableTree(order);

  if (!hasChildren) {
    return;
  }

  return (
    <Button
      ref={ref}
      variant="ghost"
      size="icon"
      className={cn('hover:bg-border', className)}
      tabIndex={-1}
      onClick={(e) => {
        e.stopPropagation();
        toggleHideChildren(order);
      }}
      asChild
    >
      <div>
        <IconCaretDownFilled className={cn('transition-transform', isHidden && '-rotate-90')} />
      </div>
    </Button>
  );
});

RecordTableTreeArrow.displayName = 'RecordTableTreeArrow';

const RecordTableTreeTrigger = React.forwardRef<
  HTMLDivElement,
  Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> & {
    order: string;
    name: string;
    hasChildren: boolean;
    children?: React.ReactNode;
  }
>(({ order, name, hasChildren, className, children, ...props }, ref) => {
  return (
    <div ref={ref} className={cn('flex items-center gap-1', className)} {...props}>
      <RecordTableTreeIndentation order={order} name={name} />
      <RecordTableTreeArrow order={order} hasChildren={hasChildren} />
      {children}
    </div>
  );
});

RecordTableTreeTrigger.displayName = 'RecordTableTreeTrigger';

export const RecordTableTree = Object.assign(RecordTableTreeProvider, {
  Indentation: RecordTableTreeIndentation,
  Arrow: RecordTableTreeArrow,
  Trigger: RecordTableTreeTrigger,
  Row: RecordTableTreeRow,
});
