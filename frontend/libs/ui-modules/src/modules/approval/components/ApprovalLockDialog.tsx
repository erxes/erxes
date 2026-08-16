import { IconLock } from '@tabler/icons-react';
import { Button, Dialog, Spinner } from 'erxes-ui';
import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { ApprovalLockFormController } from '../hooks/useApprovalLockForm';
import { ApprovalLockForm } from './ApprovalLockForm';

export const ApprovalLockDialog = ({
  form,
  loading,
  onCreate,
  onOpenChange,
  open,
  trigger,
}: {
  form: ApprovalLockFormController;
  loading: boolean;
  onCreate: () => void;
  onOpenChange: (open: boolean) => void;
  open: boolean;
  trigger?: ReactNode;
}) => {
  const { t } = useTranslation('approval');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <Dialog.Trigger asChild>
        {trigger ?? (
          <Button variant="outline">
            <IconLock />
            {t('lock')}
          </Button>
        )}
      </Dialog.Trigger>
      <Dialog.Content className="max-w-lg">
        <Dialog.Header>
          <Dialog.Title>{t('lock-dialog-title')}</Dialog.Title>
          <Dialog.Description>
            {t('lock-dialog-description')}
          </Dialog.Description>
        </Dialog.Header>
        <ApprovalLockForm form={form} />
        <Dialog.Footer>
          <Dialog.Close asChild>
            <Button variant="ghost">{t('cancel')}</Button>
          </Dialog.Close>
          <Button disabled={loading} onClick={onCreate}>
            {loading ? <Spinner /> : <IconLock />}
            {t('lock')}
          </Button>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog>
  );
};
