import React, { useState } from 'react';

import { IconCaretDownFilled } from '@tabler/icons-react';

import type { ButtonProps } from 'erxes-ui/components/button';
import { Button } from 'erxes-ui/components/button';
import { Combobox } from 'erxes-ui/components/combobox';
import { Command } from 'erxes-ui/components/command';
import { Popover } from 'erxes-ui/components/popover';
import { cn } from 'erxes-ui/lib/utils';
import {
  SelectTreeContext,
  useSelectTreeContext,
} from 'erxes-ui/modules/select-tree/context/SelectTreeContext';
import { useSelectTreeHide } from 'erxes-ui/modules/select-tree/hooks/useSelectTreeHide';
import type { TreeCollapse } from 'erxes-ui/lib/tree-collapse';
import type { ISelectTreeItem } from '../types/selectTreeTypes';
import { fixOrder } from 'erxes-ui/utils/fixOrder';

export const SelectTreeRoot = ({
  children,
  open,
  onOpenChange,
  length,
}: {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  length?: number;
}) => {
  return (
    <SelectTreeProvider length={length}>
      <Popover open={open} onOpenChange={onOpenChange} modal>
        {children}
      </Popover>
    </SelectTreeProvider>
  );
};

/** Options ordered as a tree; `length` is the option count, and collapsed options open when it changes. */
export const SelectTreeProvider = ({
  children,
  length,
  ordered,
}: {
  children: React.ReactNode;
  length?: number;
  ordered?: boolean;
}) => {
  const [collapse, setCollapse] = useState<TreeCollapse>({ rowCount: length, orders: [] });

  return (
    <SelectTreeContext.Provider value={{ ordered, length, collapse, setCollapse }}>
      {children}
    </SelectTreeContext.Provider>
  );
};

export const SelectTreeArrow = React.forwardRef<
  HTMLButtonElement,
  ButtonProps & { order: string; hasChildren: boolean }
>(({ order, hasChildren, ...props }, ref) => {
  const { toggleHideChildren, isHidden } = useSelectTreeHide(order);

  if (!hasChildren) {
    return;
  }

  return (
    <Button
      ref={ref}
      variant="ghost"
      size="icon"
      {...props}
      tabIndex={-1}
      onClick={() => toggleHideChildren(order)}
      asChild
    >
      <div>
        <IconCaretDownFilled className={cn('transition-transform', isHidden && '-rotate-90')} />
      </div>
    </Button>
  );
});

export const SelectTreeIndentation = ({ order }: { order: string }) => {
  // One guide line per ancestor; the depth is the identity of each line.
  const depths = [...Array(order.split('/').length - 1).keys()];

  if (depths.length === 0) {
    return null;
  }

  return (
    <div className="flex h-full px-3.5 gap-8">
      {depths.map((depth) => (
        <div key={depth} className="relative">
          <div className="absolute -top-4 h-8 -left-[0.5px] w-px bg-border flex-none" />
        </div>
      ))}
    </div>
  );
};

const SelectTreeItem = React.forwardRef<
  React.ElementRef<typeof Command.Item>,
  React.ComponentPropsWithoutRef<typeof Command.Item> & ISelectTreeItem
>(({ _id, name, order, hasChildren, selected, ...props }, ref) => {
  const { ordered } = useSelectTreeContext();
  const fixedOrder = fixOrder({ order, name });

  const { isHiddenByParent } = useSelectTreeHide(fixedOrder);

  if (!ordered) {
    return (
      <SelectTreeCommandItem
        {...props}
        _id={_id}
        name={name}
        order={order}
        hasChildren={hasChildren}
        selected={selected}
        ref={ref}
      />
    );
  }

  if (isHiddenByParent) {
    return null;
  }

  return (
    <div className="flex items-center gap-1 w-full">
      <SelectTreeIndentation order={fixedOrder ?? ''} />
      <SelectTreeArrow order={fixedOrder ?? ''} hasChildren={hasChildren} />
      <SelectTreeCommandItem
        {...props}
        _id={_id}
        name={name}
        order={order}
        hasChildren={hasChildren}
        selected={selected}
        ref={ref}
      />
    </div>
  );
});

export const SelectTreeCommandItem = React.forwardRef<
  React.ElementRef<typeof Command.Item>,
  React.ComponentPropsWithoutRef<typeof Command.Item> & ISelectTreeItem
>(({ _id, name, order, hasChildren, selected, children, ...props }, ref) => {
  return (
    <Command.Item
      className={cn(
        'py-0 items-center flex-1 overflow-hidden justify-start',
        props.className,
        selected && 'text-primary',
      )}
      {...props}
      ref={ref}
    >
      {children}
      <Combobox.Check checked={selected} />
    </Command.Item>
  );
});

export const SelectTree = Object.assign(SelectTreeRoot, {
  Item: SelectTreeItem,
  Provider: SelectTreeProvider,
});
