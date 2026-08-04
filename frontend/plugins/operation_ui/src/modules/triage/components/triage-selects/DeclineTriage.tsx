import { STATUS_TYPES } from '@/operation/components/StatusInline';
import { useConvertTriage } from '@/triage/hooks/useConvertTriage';
import { Button, Dialog, Textarea } from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

export const DeclineTriage = ({ triageId }: { triageId: string }) => {
  const { t } = useTranslation('operation');
  const [reason, setReason] = useState('');
  const [open, setOpen] = useState(false);
  const { convertTriageToTask, loading } = useConvertTriage();
  const declineTriage = () => {
    convertTriageToTask({
      variables: {
        id: triageId,
        status: STATUS_TYPES.CANCELLED,
        reason,
      },
      onCompleted: () => {
        setOpen(false);
        setReason('');
      },
    });
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <Button variant="outline">{t('decline-triage')}</Button>
      </Dialog.Trigger>
      <Dialog.Content>
        <Dialog.Header>
          <Dialog.Title>{t('decline-triage')}</Dialog.Title>
          <Dialog.Description className="pt-1">
            {t('decline-triage-reason')}
          </Dialog.Description>
        </Dialog.Header>
        <div className="py-3">
          <Textarea
            placeholder={t('reason-placeholder')}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </div>
        <Dialog.Footer>
          <Dialog.Close asChild>
            <Button variant="ghost">{t('cancel')}</Button>
          </Dialog.Close>
          <Button onClick={declineTriage} disabled={!reason || loading}>
            {t('decline')}
          </Button>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog>
  );
};
