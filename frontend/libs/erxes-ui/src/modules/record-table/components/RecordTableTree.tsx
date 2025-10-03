import { useEffect } from 'react';
import { useSetAtom } from 'jotai';
import { RecordTableTreeContext } from '../contexts/RecordTableTreeContext';
import { recordTableTreeHideChildrenAtomFamily } from '../states/RecordTableTreeState';
import { IRecordTableTreeContext } from '../types/RecordTableTreeTypes';
import { useRecordTableTree } from '../hooks/useRecordTableTree';
import { fixOrder } from 'erxes-ui/utils/fixOrder';
import React from 'react';
import { Button, ButtonProps } from 'erxes-ui/components';
import { IconCaretDownFilled } from '@tabler/icons-react';
import { cn } from 'erxes-ui/lib';
import { RecordTableRow } from './RecordTableRow';

const RecordTableTreeProvider = ({
  id,
  children,
  ordered,
  length,
}: IRecordTableTreeContext) => {
  const setHideChildrenState = useSetAtom(
    recordTableTreeHideChildrenAtomFamily(id),
  );

  useEffect(() => {
    setHideChildrenState([]);
  }, [length, setHideChildrenState]);

  return (
    <RecordTableTreeContext.Provider value={{ id, children, ordered, length }}>
      {children}
    </RecordTableTreeContext.Provider>
  );
};

const RecordTableTreeIndentation = ({
  order,
  name,
}: {
  order: string;
  name: string;
}) => {
  const fixedOrder = fixOrder({ order, name });
  const { ordered } = useRecordTableTree(fixedOrder || '');

  const level = fixedOrder?.match(/[/]/gi)?.length || 0;
  if (level <= 0 || !ordered) {
    return null;
  }

  return (
    <div className="flex h-full px-3.5 gap-8">
      {Array.from({ length: level }).map((_, index) => (
        <div key={index} />
      ))}
    </div>
  );
};
const RecordTableTreeRow = React.forwardRef<
  HTMLTableRowElement,
  React.ComponentProps<typeof RecordTableRow>
>(({ original, ...props }, ref) => {
  const { ordered, isHiddenByParent } = useRecordTableTree(original?.order);

  if (ordered && isHiddenByParent) {
    return null;
  }

  return <RecordTableRow ref={ref} {...props} />;
});

RecordTableTreeRow.displayName = 'RecordTableTreeRow';

const RecordTableTreeArrow = React.forwardRef<
  HTMLButtonElement,
  ButtonProps & { order: string; hasChildren: boolean }
>(({ order, hasChildren, className, ...props }, ref) => {
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
        <IconCaretDownFilled
          className={cn('transition-transform', isHidden && '-rotate-90')}
        />
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
    <div
      ref={ref}
      className={cn('flex items-center gap-1', className)}
      {...props}
    >
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
