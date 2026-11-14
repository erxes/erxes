import { useBroadcastSender } from '@/broadcast/hooks/useBroadcastSender';
import { domainOf } from '@/broadcast/utils/senderAddress';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';

const isEmail = (value?: string) =>
  !value || z.string().email().safeParse(value).success;

/**
 * The From field: the sender name is always typed; the address is fixed when
 * the workspace locks it, picked from verified domains, or typed freely.
 */
export const useBroadcastFromField = () => {
  const { control } = useFormContext();
  const { t } = useTranslation('broadcasts', { keyPrefix: 'composer' });
  const sender = useBroadcastSender();
  const isLocked = sender.mode === 'locked';

  return {
    control,
    sender,
    isLocked,
    isDomainPicker: sender.mode === 'domains',
    senderRules: { required: t('sender-required') },
    fromRules: {
      required: t('from-required'),
      validate: (value?: string) => isEmail(value) || t('invalid-email'),
    },
    lockedMessage: isLocked
      ? t(`from-locked-${sender.lock}`, {
          domain: domainOf(sender.lockedAddress),
        })
      : '',
    showSettingsLink: isLocked && sender.lock === 'unverified',
  };
};
