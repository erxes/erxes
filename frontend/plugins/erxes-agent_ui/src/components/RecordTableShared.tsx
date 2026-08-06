import { ColumnDef } from '@tanstack/react-table';
import {
  IconToggleLeft,
  IconToggleRight,
  IconTrash,
} from '@tabler/icons-react';
import {
  Badge,
  Button,
  Command,
  RecordTable,
  RecordTableInlineCell,
} from 'erxes-ui';

// Bits shared by the plugin's record tables (agents, workflows, schedules)
// so the row menus and status columns stay identical across the lists.

/** Enable/disable + delete tail of a row actions menu. */
export const ToggleDeleteMenuItems = ({
  isEnabled,
  onToggle,
  onDelete,
}: {
  isEnabled: boolean;
  onToggle: () => void;
  onDelete: () => void;
}) => (
  <>
    <Command.Item asChild>
      <Button
        variant="ghost"
        size="sm"
        className="justify-start w-full h-8"
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
      </Button>
    </Command.Item>
    <Command.Item asChild>
      <Button
        variant="ghost"
        size="sm"
        className="justify-start w-full h-8 text-destructive"
        onClick={onDelete}
      >
        <IconTrash className="size-4" /> Delete
      </Button>
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
