import { Dialog, Button } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import type { TriageConversionDialogProps } from '@/triage/types/triageFields';

export const TriageConversionDialog = ({
  open,
  onOpenChange,
  onConfirm,
}: TriageConversionDialogProps) => {
  const { t } = useTranslation('operation');
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <Dialog.Content>
        <Dialog.Header>
          <Dialog.Title>{t('convert-to-task')}</Dialog.Title>
        </Dialog.Header>
        <div className="py-4">
          <p>{t('convert-triage-confirm')}</p>
        </div>
        <Dialog.Footer>
          <Dialog.Close asChild>
            <Button variant="outline">{t('cancel')}</Button>
          </Dialog.Close>
          <Button onClick={onConfirm}>{t('confirm')}</Button>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog>
  );
};
