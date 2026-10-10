import { useTranslation } from 'react-i18next';
import { EMAIL_SUPPRESSION_REASON_OPTIONS } from '@/settings/email-addresses/constants';
import { useReleaseEmailAddress } from '@/settings/email-addresses/hooks/useEmailAddresses';
import {
  IEmailAddress,
  TEmailSuppressionReason,
} from '@/settings/email-addresses/types';
import { IconLockOpen } from '@tabler/icons-react';
import dayjs from 'dayjs';
import { Button, Dialog, Input, Label } from 'erxes-ui';
import { useState } from 'react';

const reasonLabel = (reason?: TEmailSuppressionReason) =>
  EMAIL_SUPPRESSION_REASON_OPTIONS.find((option) => option.value === reason)
    ?.label ?? 'an unrecorded reason';

export const ReleaseEmailAddressDialog = ({
  address,
  open,
  onOpenChange,
}: {
  address: IEmailAddress;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'email-addresses' });
  const [typed, setTyped] = useState('');
  const [note, setNote] = useState('');
  const { release, loading } = useReleaseEmailAddress();

  const matches = typed.trim().toLowerCase() === address.email.toLowerCase();
  const canSubmit = matches && note.trim().length > 0 && !loading;

  const close = (next: boolean) => {
    if (!next) {
      setTyped('');
      setNote('');
    }

    onOpenChange(next);
  };

  const onSubmit = async () => {
    await release(address.email, note.trim());

    close(false);
  };

  return (
    <Dialog open={open} onOpenChange={close}>
      <Dialog.Content className="max-w-md">
        <Dialog.Header>
          <Dialog.Title>{t('reopen-this-address')}</Dialog.Title>
          <Dialog.Description>
            {address.email} was closed
            {address.suppressedAt
              ? ` on ${dayjs(address.suppressedAt).format('MMM D, YYYY')}`
              : ''}{' '}
            for {reasonLabel(address.suppressionReason)}. Mail will go to it
            again — if the mailbox is still gone it will bounce and close itself
            once more.
          </Dialog.Description>
        </Dialog.Header>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="release-confirm">
              {t('type-address-to-confirm')}
            </Label>
            <Input
              id="release-confirm"
              value={typed}
              placeholder={address.email}
              autoComplete="off"
              onChange={(event) => setTyped(event.target.value)}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="release-note">{t('why-reopening')}</Label>
            <Input
              id="release-note"
              value={note}
              placeholder={t('reopen-note-placeholder')}
              onChange={(event) => setNote(event.target.value)}
            />
          </div>
        </div>

        <Dialog.Footer>
          <Button variant="secondary" onClick={() => close(false)}>
            {t('cancel')}
          </Button>
          <Button disabled={!canSubmit} onClick={onSubmit}>
            <IconLockOpen className="size-4" />
            {t('reopen-address')}
          </Button>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog>
  );
};
