import type { ToolbarMenuItemProps } from 'erxes-ui/modules/blocks/types/toolbar/ToolbarMenuItemProps';
import { components } from '@blocknote/shadcn';
import { cn } from 'erxes-ui/lib';
import { DropdownMenu } from 'erxes-ui/components';

export const ToolbarMenuItem = ({
  className,
  disabled,
  ...props
}: ToolbarMenuItemProps) => {
  const itemClassName = cn(
    'pl-2! [&>.bn-absolute]:hidden!',
    'hover:bg-(--color-primary)/15! hover:text-(--color-primary)!',
    'focus:bg-(--color-primary)/15! focus:text-(--color-primary)!',
    'data-[state=checked]:bg-(--color-primary)/10! data-[state=checked]:text-(--color-primary)!',
    className,
  );

  if (disabled) {
    return (
      <DropdownMenu.Item
        disabled
        className={itemClassName}
        role={props.checked === undefined ? 'menuitem' : 'menuitemcheckbox'}
        aria-checked={props.checked}
      >
        {props.icon}
        {props.children}
      </DropdownMenu.Item>
    );
  }

  return <components.Generic.Menu.Item {...props} className={itemClassName} />;
};
