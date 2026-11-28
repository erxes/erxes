import type { ComponentProps, ReactNode } from 'react';
import { Combobox } from 'erxes-ui/components/combobox';
import { Command } from 'erxes-ui/components/command';
import { Popover } from 'erxes-ui/components/popover';
import { cn } from 'erxes-ui/lib/utils';
import {
  fixOrder,
  levelOf,
  TreeArrow,
  TreeProvider,
  useTreeFold,
} from 'erxes-ui/modules/tree/treeFold';

/** One step per level, each with the guide line that joins a row to its parent. */
const SelectTreeIndentation = ({ order }: { order: string }) => {
  const level = levelOf(order);

  if (level <= 0) return null;

  return (
    <div className="flex h-full gap-8 px-3.5">
      {Array.from({ length: level }, (_, index) => (
        <div key={index} className="relative">
          <div className="absolute -top-4 left-0 h-8 w-px flex-none -translate-x-1/2 bg-border" />
        </div>
      ))}
    </div>
  );
};

type SelectTreeItemProps = ComponentProps<typeof Command.Item> & {
  name: string;
  /** Its path in the tree ("01/02/"). */
  order: string;
  hasChildren: boolean;
  selected?: boolean;
};

const SelectTreeCommandItem = ({
  selected,
  children,
  className,
  ...props
}: Omit<SelectTreeItemProps, 'name' | 'order' | 'hasChildren'>) => (
  <Command.Item
    checked={selected}
    className={cn('flex-1 justify-start overflow-hidden', className)}
    {...props}
  >
    {children}
    <Combobox.Check checked={selected} />
  </Command.Item>
);

/** A picker row in the tree: indented with a fold arrow while the list is in tree order. */
const SelectTreeItem = ({ name, order, hasChildren, ...props }: SelectTreeItemProps) => {
  const fixed = fixOrder({ order, name });
  const { ordered, isHiddenByParent } = useTreeFold(fixed);

  if (!ordered) return <SelectTreeCommandItem {...props} />;

  if (isHiddenByParent) return null;

  return (
    <div className="flex w-full items-center gap-1">
      <SelectTreeIndentation order={fixed} />
      <TreeArrow order={fixed} hasChildren={hasChildren} />
      <SelectTreeCommandItem {...props} />
    </div>
  );
};

/** A picker's popover over a tree of items; its fold state is `id`'s. */
const SelectTreeRoot = ({
  id,
  children,
  open,
  onOpenChange,
  length,
}: {
  id: string;
  children: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  length?: number;
}) => (
  <TreeProvider id={id} length={length}>
    <Popover open={open} onOpenChange={onOpenChange} modal>
      {children}
    </Popover>
  </TreeProvider>
);

/**
 * A picker's items as a tree, indented with arrows that fold.
 * `SelectTree.Provider` (an `id`, `ordered` while the items are in tree order, unsearched) wraps
 * the list, and each item is a `SelectTree.Item` with its `order` path and `hasChildren`.
 */
export const SelectTree = Object.assign(SelectTreeRoot, {
  Item: SelectTreeItem,
  Provider: TreeProvider,
});
