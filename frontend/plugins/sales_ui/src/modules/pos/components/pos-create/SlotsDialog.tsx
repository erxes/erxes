import { useState } from 'react';
import { Button, Dialog, Label } from 'erxes-ui';
import { IconPlus } from '@tabler/icons-react';
import POSSlotsManager from '@/pos/slot/components/slot';
import type { CustomNode } from '@/pos/slot/types';

interface SlotsDialogProps {
  value?: number | string;
  onChange: (value: number, nodes?: CustomNode[]) => void;
}

export const SlotsDialog: React.FC<SlotsDialogProps> = ({
  value,
  onChange,
}) => {
  const [open, setOpen] = useState<boolean>(false);
  const [nodes, setNodes] = useState<CustomNode[]>([]);
  const slotCount =
    typeof value === 'string' ? Number.parseInt(value) || 0 : value || 0;

  const handleSave = () => {
    onChange(nodes.length, nodes);
    setOpen(false);
  };

  const handleCancel = () => {
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <div className="space-y-2">
        <Label className="text-sm font-medium">Slots</Label>
        <Dialog.Trigger asChild>
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="justify-start w-full"
          >
            <IconPlus size={16} className="mr-2" />
            {slotCount > 0
              ? `${slotCount} Slots Configured`
              : 'Configure Slots'}
          </Button>
        </Dialog.Trigger>
      </div>

      <Dialog.Content className="sm:max-w-4xl max-h-[90vh] flex flex-col">
        <Dialog.Header>
          <Dialog.Title>Configure Slots</Dialog.Title>
        </Dialog.Header>

        <div className="overflow-hidden flex-1 min-h-0 rounded-md border">
          <POSSlotsManager
            posId=""
            initialNodes={nodes}
            onNodesChange={setNodes}
            isCreating={true}
          />
        </div>

        <Dialog.Footer>
          <Button type="button" variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSave}>
            Save Slots ({nodes.length})
          </Button>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog>
  );
};
