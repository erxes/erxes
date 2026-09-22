import { useState } from 'react';
import { Button, Dialog, Label } from 'erxes-ui';
import { IconPlus } from '@tabler/icons-react';
import POSSlotsManager from '@/pos/slot/components/slot';
import type { CustomNode } from '@/pos/slot/types';
import { useTranslation } from 'react-i18next';

interface SlotsDialogProps {
  value?: number | string;
  onChange: (value: number, nodes?: CustomNode[]) => void;
}

export const SlotsDialog: React.FC<SlotsDialogProps> = ({
  value,
  onChange,
}) => {
  const { t } = useTranslation('sales');
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
        <Label className="text-sm font-medium">{t('slots')}</Label>
        <Dialog.Trigger asChild>
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="justify-start w-full"
          >
            <IconPlus size={16} className="mr-2" />
            {slotCount > 0
              ? `${slotCount} ${t('slots-configured')}`
              : t('configure-slots')}
          </Button>
        </Dialog.Trigger>
      </div>

      <Dialog.Content className="flex h-[90vh] w-[calc(100vw-2rem)] flex-col max-w-7xl">
        <Dialog.Header>
          <Dialog.Title>{t('configure-slots')}</Dialog.Title>
          <Dialog.Description className="sr-only">
            {t('configure-slots-description')}
          </Dialog.Description>
        </Dialog.Header>

        <div className="flex-1 min-h-0 overflow-hidden border rounded-md">
          <POSSlotsManager
            posId=""
            initialNodes={nodes}
            onNodesChange={setNodes}
            isCreating={true}
          />
        </div>

        <Dialog.Footer>
          <Button type="button" variant="outline" onClick={handleCancel}>
            {t('cancel')}
          </Button>
          <Button type="button" onClick={handleSave}>
            {t('save-slots')} ({nodes.length})
          </Button>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog>
  );
};
