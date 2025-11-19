import {
  IconEdit,
  IconCopy,
  IconTrash,
  IconChevronDown,
} from '@tabler/icons-react';
import { Popover, Spinner } from 'erxes-ui';

interface ActionMenuProps {
  onEdit: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  duplicateLoading: boolean;
}

interface DropdownItem {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
}

export const ActionMenu = ({
  onEdit,
  onDuplicate,
  onDelete,
  duplicateLoading,
}: ActionMenuProps) => {
  const dropdownItems = [
    {
      label: 'Edit',
      icon: <IconEdit size={16} stroke={1.5} />,
      onClick: () => onEdit(),
    },
    {
      label: duplicateLoading ? 'Duplicating…' : 'Duplicate',
      icon: duplicateLoading ? (
        <Spinner className="w-4 h-4" />
      ) : (
        <IconCopy className="size-4" />
      ),
      onClick: () => onDuplicate(),
      disabled: duplicateLoading,
    },
    // {
    //   label: 'Visit website',
    //   icon: <IconWorld size={16} stroke={1.5} />,
    //   onClick: () => window.open(branch.website, '_blank'),
    // },
    {
      label: 'Delete',
      icon: <IconTrash size={16} stroke={1.5} />,
      onClick: () => onDelete(),
    },
  ];

  return (
    <Popover>
      <Popover.Trigger asChild>
        <button
          className="flex items-center leading-[100%] text-foreground font-inter gap-1 text-sm font-medium rounded-md p-1 hover:bg-muted focus:outline-hidden"
          aria-label="Open action menu"
          aria-haspopup="true"
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
        {dropdownItems.map((item: DropdownItem) => (
          <button
            key={item.label}
            type="button"
            role="menuitem"
            className={`flex gap-3 items-center px-4 py-2 w-full text-left rounded-md hover:bg-muted focus:outline-hidden focus:bg-muted ${
              item.disabled ? 'opacity-60 cursor-not-allowed' : ''
            }`}
            onClick={() => {
              if (!item.disabled) {
                item.onClick();
              }
            }}
            disabled={item.disabled}
          >
            {item.icon}
            <p className="text-sm font-medium leading-[100%] font-inter">
              {item.label}
            </p>
          </button>
        ))}
      </Popover.Content>
    </Popover>
  );
};
