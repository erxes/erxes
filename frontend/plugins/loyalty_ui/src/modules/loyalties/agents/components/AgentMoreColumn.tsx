import { Cell } from '@tanstack/react-table';
import {
  Button,
  Combobox,
  Command,
  Popover,
  RecordTable,
  useConfirm,
  useToast,
} from 'erxes-ui';
import { IconEdit, IconTrash } from '@tabler/icons-react';
import { useState } from 'react';
import { useDeleteAgent } from '../hooks/useDeleteAgent';
import { IAgent } from '../types/agent';
import { AgentEditSheet } from './AgentEditSheet';

export const AgentMoreColumnCell = ({
  cell,
}: {
  cell: Cell<IAgent, unknown>;
}) => {
  const agent = cell.row.original;
  const [editOpen, setEditOpen] = useState(false);
  const { deleteAgent, loading } = useDeleteAgent();
  const { confirm } = useConfirm();
  const { toast } = useToast();
  const confirmationValue = 'delete';
  const handleDelete = () => {
    if (!agent._id) return;

    confirm({
      options: { confirmationValue },
      message: 'Are you sure you want to delete this agent?',
    }).then(() => {
      deleteAgent(agent._id).catch(() => {
        toast({
          title: 'Error',
          description: 'Failed to delete agent',
          variant: 'destructive',
        });
      });
    });
  };

  return (
    <>
      <Popover>
        <Popover.Trigger asChild>
          <RecordTable.MoreButton className="w-full h-full" />
        </Popover.Trigger>
        <Combobox.Content
          align="start"
          className="w-[280px] min-w-0 [&>button]:cursor-pointer"
          onClick={(e) => e.stopPropagation()}
        >
          <Command>
            <Command.List>
              <Command.Item value="edit" onSelect={() => setEditOpen(true)}>
                <IconEdit /> Edit
              </Command.Item>
              <Command.Item asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start h-8"
                  onClick={handleDelete}
                  disabled={loading}
                >
                  <IconTrash className="size-4" />
                  Delete
                </Button>
              </Command.Item>
            </Command.List>
          </Command>
        </Combobox.Content>
      </Popover>
      {editOpen && (
        <AgentEditSheet
          agent={agent}
          open={editOpen}
          onOpenChange={setEditOpen}
        />
      )}
    </>
  );
};

export const agentMoreColumn = {
  id: 'more',
  cell: AgentMoreColumnCell,
  size: 25,
};
