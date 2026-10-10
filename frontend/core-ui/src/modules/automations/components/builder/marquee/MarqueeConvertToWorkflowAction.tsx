import { useConvertSelectionToWorkflowDialog } from '@/automations/components/builder/hooks/useConvertSelectionToWorkflowDialog';
import { useAutomation } from '@/automations/context/AutomationProvider';
import { IconArrowsSplit2 } from '@tabler/icons-react';
import { Button, Dialog, Input } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

export const MarqueeConvertToWorkflowAction = ({
  actionIds,
  onConverted,
}: {
  actionIds: string[];
  onConverted: () => void;
}) => {
  const { canConvert, doc, isOpen, onConvert, setDoc, setOpen } =
    useConvertSelectionToWorkflowDialog({ actionIds, onConverted });
  const { isReadOnly } = useAutomation();
  const { t } = useTranslation('automations');

  return (
    <>
      <Button disabled={isReadOnly} onClick={() => setOpen(true)}>
        <IconArrowsSplit2 />
        {t('marquee-convert-to-workflow')}
      </Button>

      <Dialog open={isOpen} onOpenChange={setOpen}>
        <Dialog.Content>
          <Dialog.Title>{t('marquee-convert-to-workflow')}</Dialog.Title>
          <Dialog.Description>
            {t('marquee-convert-description')}
          </Dialog.Description>
          <Input
            name="name"
            value={doc.name}
            onChange={(event) =>
              setDoc({ ...doc, name: event.currentTarget.value })
            }
          />
          <Input
            type="textarea"
            name="description"
            placeholder={t('description')}
            value={doc.description}
            onChange={(event) =>
              setDoc({ ...doc, description: event.currentTarget.value })
            }
          />
          <Dialog.Footer>
            <Button onClick={onConvert} disabled={!canConvert}>
              {t('marquee-convert')}
            </Button>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog>
    </>
  );
};
