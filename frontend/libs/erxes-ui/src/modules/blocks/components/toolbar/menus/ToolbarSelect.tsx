import { useComponentsContext } from '@blocknote/react';
import type { ComponentProps } from '@blocknote/react';
import { IconChevronDown } from '@tabler/icons-react';
import { ToolbarMenuItem } from 'erxes-ui/modules/blocks/components/toolbar/menus/ToolbarMenuItem';

export const ToolbarSelect = ({
  items,
  className,
  isDisabled,
}: ComponentProps['FormattingToolbar']['Select']) => {
  const Components = useComponentsContext();
  const selectedItem = items.find((item) => item.isSelected);

  if (!Components || !items.length) {
    return null;
  }

  return (
    <Components.Generic.Menu.Root>
      <Components.Generic.Menu.Trigger>
        <Components.FormattingToolbar.Button
          label={selectedItem?.text ?? 'Block type'}
          mainTooltip={selectedItem?.text ?? 'Block type'}
          icon={selectedItem?.icon}
          isDisabled={isDisabled}
          className="bn-button gap-1"
        >
          {selectedItem?.text ?? 'Block type'}
          <IconChevronDown size={14} />
        </Components.FormattingToolbar.Button>
      </Components.Generic.Menu.Trigger>
      <Components.Generic.Menu.Dropdown className={className}>
        {items.map((item) => (
          <ToolbarMenuItem
            key={item.text}
            icon={item.icon}
            checked={item.isSelected}
            disabled={item.isDisabled}
            className={
              item.isDisabled ? 'pointer-events-none opacity-50' : undefined
            }
            onClick={item.isDisabled ? undefined : item.onClick}
          >
            {item.text}
          </ToolbarMenuItem>
        ))}
      </Components.Generic.Menu.Dropdown>
    </Components.Generic.Menu.Root>
  );
};
