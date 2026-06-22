import { ColumnDef } from '@tanstack/react-table';
import {
  IconToggleLeft,
  IconToggleRight,
  IconTrash,
} from '@tabler/icons-react';
import {
  Badge,
  Combobox,
  Command,
  Popover,
  RecordTable,
  RecordTableInlineCell,
} from 'erxes-ui';
import { PermissionButton } from './PermissionButton';

// Bits shared by the plugin's record tables (agents, workflows, schedules)
// so the row menus and status columns stay identical across the lists.

/** Popover-anchored "more" menu shared by every list's actions column. */
export const RowActionsMenu = ({ children }: { children: React.ReactNode }) => (
  <Popover>
    <Popover.Trigger asChild>
      <RecordTable.MoreButton className="w-full h-full" />
    </Popover.Trigger>
    <Combobox.Content
      side="right"
      align="start"
      avoidCollisions={false}
      className="w-44 min-w-0 [&>button]:cursor-pointer"
      onClick={(e) => e.stopPropagation()}
    >
      <Command>
        <Command.List>{children}</Command.List>
      </Command>
    </Combobox.Content>
  </Popover>
);

/** Enable/disable + delete tail of a row actions menu. */
export const ToggleDeleteMenuItems = ({
  isEnabled,
  onToggle,
  onDelete,
  toggleDisabled = false,
  deleteDisabled = false,
  onToggleDenied,
  onDeleteDenied,
}: {
  isEnabled: boolean;
  onToggle: () => void;
  onDelete: () => void;
  toggleDisabled?: boolean;
  deleteDisabled?: boolean;
  onToggleDenied?: () => void;
  onDeleteDenied?: () => void;
}) => (
  <>
    <Command.Item asChild>
      <PermissionButton
        variant="ghost"
        size="sm"
        className="justify-start w-full h-8"
        allowed={!toggleDisabled}
        onDenied={onToggleDenied ?? (() => {})}
        onClick={onToggle}
      >
        {isEnabled ? (
          <>
            <IconToggleLeft className="size-4" /> Disable
          </>
        ) : (
          <>
            <IconToggleRight className="size-4" /> Enable
          </>
        )}
      </PermissionButton>
    </Command.Item>
    <Command.Item asChild>
      <PermissionButton
        variant="ghost"
        size="sm"
        className="justify-start w-full h-8 text-destructive"
        allowed={!deleteDisabled}
        onDenied={onDeleteDenied ?? (() => {})}
        onClick={onDelete}
      >
        <IconTrash className="size-4" /> Delete
      </PermissionButton>
    </Command.Item>
  </>
);

/** The Active/Disabled status column over a row's isEnabled flag. */
export const enabledStatusColumn = <
  T extends { isEnabled: boolean },
>(): ColumnDef<T> => ({
  id: 'status',
  accessorKey: 'isEnabled',
  header: () => (
    <RecordTable.InlineHead icon={IconToggleRight} label="Status" />
  ),
  cell: ({ cell }) => {
    const isEnabled = cell.getValue() as boolean;
    return (
      <RecordTableInlineCell>
        <Badge variant={isEnabled ? 'success' : 'secondary'}>
          {isEnabled ? 'Active' : 'Disabled'}
        </Badge>
      </RecordTableInlineCell>
    );
  },
  size: 100,
});
