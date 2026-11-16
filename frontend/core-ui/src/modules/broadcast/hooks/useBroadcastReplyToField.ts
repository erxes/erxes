import { IEmailSender } from '@/settings/mail-config/hooks/useVerifiedSenders';
import { useCallback } from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';

const isEmail = (value?: string) =>
  !value || z.string().email().safeParse(value).success;

/** An address check that passes an empty value, for the reply-to inputs. */
export const useReplyToEmailRule = () => {
  const { t } = useTranslation('broadcasts', { keyPrefix: 'composer' });

  return useCallback(
    (value?: string) => isEmail(value) || t('invalid-email'),
    [t],
  );
};

/**
 * The locked From's reply-to: the confirmed address picked here speaks for
 * the mail, and its sender name fills the name when it has one.
 */
export const useLockedReplyTo = () => {
  const { control, setValue } = useFormContext();
  const { t } = useTranslation('broadcasts', { keyPrefix: 'composer' });
  const validateEmail = useReplyToEmailRule();

  const pickAddress = useCallback(
    (onChange: (value: string) => void) =>
      (value: string, picked?: IEmailSender) => {
        onChange(value);

        if (picked?.name) {
          setValue('email.sender', picked.name, { shouldDirty: true });
        }
      },
    [setValue],
  );

  return {
    control,
    rules: { required: t('reply-to-required'), validate: validateEmail },
    pickAddress,
  };
};
