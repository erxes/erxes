import { SelectVerifiedSender } from '@/settings/mail-config/components/SelectVerifiedSender';
import { useSenderOptions } from '@/settings/mail-config/hooks/useVerifiedSenders';
import { Form, Skeleton } from 'erxes-ui';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';

const isEmail = (value?: string) =>
  !value || z.string().email().safeParse(value).success;

export const BroadcastReplyToField = () => {
  const { control, setValue } = useFormContext();
  const { alignedFrom, loading: senderOptionsLoading } = useSenderOptions();
  const { t } = useTranslation('broadcasts', { keyPrefix: 'composer' });

  if (senderOptionsLoading) {
    return (
      <div className="space-y-2">
        <span className="font-mono text-xs font-semibold uppercase text-accent-foreground">
          {t('replyTo')}
        </span>
        <Skeleton className="h-8 w-full" />
      </div>
    );
  }

  return (
    <Form.Field
      name={alignedFrom ? 'fromEmail' : 'email.replyTo'}
      control={control}
      rules={{
        required: alignedFrom ? t('reply-to-required') : undefined,
        validate: (value?: string) => isEmail(value) || t('invalid-email'),
      }}
      render={({ field }) => (
        <Form.Item>
          <Form.Label>
            {t('replyTo')}
            {alignedFrom && <span className="text-destructive">*</span>}
          </Form.Label>
          <Form.Control>
            <SelectVerifiedSender
              value={field.value}
              onChange={(value, sender) => {
                field.onChange(value);

                if (sender?.name) {
                  setValue('email.sender', sender.name, {
                    shouldDirty: true,
                  });
                }
              }}
              placeholder={t('reply-to-placeholder')}
            />
          </Form.Control>
          <Form.Message />
        </Form.Item>
      )}
    />
  );
};
