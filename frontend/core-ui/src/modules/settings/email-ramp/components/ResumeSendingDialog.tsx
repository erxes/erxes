import { useTranslation } from 'react-i18next';
import { useResumeSending } from '@/settings/email-ramp/hooks/useEmailRamp';
import { IconPlayerPlay } from '@tabler/icons-react';
import { Button, Dialog, Input, Label } from 'erxes-ui';
import { useState } from 'react';

export const ResumeSendingDialog = ({
  reason,
  open,
  onOpenChange,
}: {
  reason?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'email-ramp' });
  const [note, setNote] = useState('');
  const { resume, loading } = useResumeSending();

  const close = (next: boolean) => {
    if (!next) {
      setNote('');
    }

    onOpenChange(next);
  };

  const onSubmit = async () => {
    if (await resume(note.trim())) {
      close(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={close}>
      <Dialog.Content className="max-w-md">
        <Dialog.Header>
          <Dialog.Title>{t('resume-sending')}</Dialog.Title>
          <Dialog.Description>
            {reason ?? t('stopped-reason-default')} {t('resume-description')}
          </Dialog.Description>
        </Dialog.Header>

        <div className="flex flex-col gap-2">
          <Label htmlFor="resume-note">{t('what-was-fixed')}</Label>
          <Input
            id="resume-note"
            value={note}
            placeholder={t('what-was-fixed-placeholder')}
            onChange={(event) => setNote(event.target.value)}
          />
        </div>

        <Dialog.Footer>
          <Button variant="secondary" onClick={() => close(false)}>
            {t('cancel')}
          </Button>
          <Button disabled={!note.trim() || loading} onClick={onSubmit}>
            <IconPlayerPlay className="size-4" />
            {t('resume-sending')}
          </Button>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog>
  );
};
