import React, { useEffect } from 'react';

import { IconCaretDownFilled } from '@tabler/icons-react';

import {
  Button,
  ButtonProps,
  Combobox,
  Command,
  Popover,
} from 'erxes-ui/components';
import { cn } from 'erxes-ui/lib';
import {
  SelectTreeContext,
  useSelectTreeContext,
} from 'erxes-ui/modules/select-tree/context/SelectTreeContext';
import { useSelectTreeHide } from 'erxes-ui/modules/select-tree/hooks/useSelectTreeHide';
import { hideChildrenAtomFamily } from '../states/selectTreeStates';
import { useSetAtom } from 'jotai';
import { ISelectTreeItem } from '../types/selectTreeTypes';
import { fixOrder } from 'erxes-ui/utils/fixOrder';

export const SelectTreeRoot = ({
  id,
  children,
  open,
  onOpenChange,
  length,
}: {
  id: string;
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  length?: number;
}) => {
  return (
    <SelectTreeProvider id={id} length={length}>
      <Popover open={open} onOpenChange={onOpenChange} modal>
        {children}
      </Popover>
    </SelectTreeProvider>
  );
};

export const SelectTreeProvider = ({
  id,
  children,
  length,
  ordered,
}: {
  id: string;
  children: React.ReactNode;
  length?: number;
  ordered?: boolean;
}) => {
  const setHideChildrenState = useSetAtom(hideChildrenAtomFamily(id));

  useEffect(() => {
    setHideChildrenState([]);
  }, [length, setHideChildrenState]);

  return (
    <SelectTreeContext.Provider value={{ id, ordered }}>
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
        <IconCaretDownFilled
          className={cn('transition-transform', isHidden && '-rotate-90')}
        />
      </div>
    </Button>
  );
});

export const SelectTreeIndentation = ({ order }: { order: string }) => {
  const level = order?.match(/[/]/gi)?.length || 0;
  if (level <= 0) {
    return null;
  }

  return (
    <div className="flex h-full px-3.5 gap-8">
      {Array.from({ length: level }).map((_, index) => (
        <div key={index} className="relative">
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
