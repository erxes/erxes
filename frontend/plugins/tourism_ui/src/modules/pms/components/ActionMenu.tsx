import type { ReactNode } from 'react';
import { IconChevronDown, IconEdit, IconTrash } from '@tabler/icons-react';
import { Popover } from 'erxes-ui';

interface ActionMenuProps {
  onEdit: () => void;
  onDelete: () => void;
}

interface DropdownItem {
  label: string;
  icon: ReactNode;
  onClick: () => void;
}

export const ActionMenu = ({ onEdit, onDelete }: ActionMenuProps) => {
  const dropdownItems: DropdownItem[] = [
    {
      label: 'Edit',
      icon: <IconEdit size={16} stroke={1.5} />,
      onClick: onEdit,
    },
    {
      label: 'Remove',
      icon: <IconTrash size={16} stroke={1.5} />,
      onClick: onDelete,
    },
  ];

  return (
    <Popover>
      <Popover.Trigger asChild>
        <button
          className="flex items-center leading-[100%] text-foreground gap-1 text-sm font-medium rounded-md p-1 hover:bg-muted focus:outline-hidden"
          aria-label="Open action menu"
          aria-haspopup="true"
          type="button"
        >
          Action
          <IconChevronDown size={18} stroke={2} />
        </button>
      </Popover.Trigger>
      <Popover.Content
        className="p-1 w-48 rounded-lg border shadow-lg bg-background"
        side="bottom"
        align="end"
      >
        {dropdownItems.map((item) => (
          <button
            key={item.label}
            type="button"
            role="menuitem"
            className="flex gap-3 items-center px-4 py-2 w-full text-left rounded-md hover:bg-muted focus:outline-hidden focus:bg-muted"
            onClick={item.onClick}
          >
            {item.icon}
            <p className="text-sm font-medium leading-[100%]">{item.label}</p>
          </button>
        ))}
      </Popover.Content>
    </Popover>
  );
};
