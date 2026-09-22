import { useSenderOptions } from '@/settings/mail-config/hooks/useVerifiedSenders';
import { Form, Input, Skeleton } from 'erxes-ui';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';

const isEmail = (value?: string) =>
  !value || z.string().email().safeParse(value).success;

export const BroadcastFromField = () => {
  const { control, watch } = useFormContext();
  const { alignedFrom, loading: senderOptionsLoading } = useSenderOptions();
  const { t } = useTranslation('broadcasts', { keyPrefix: 'composer' });

  const senderName = watch('email.sender');

  if (senderOptionsLoading) {
    return (
      <div className="space-y-2">
        <span className="font-mono text-xs font-semibold uppercase text-accent-foreground">
          {t('from')}
        </span>
        <Skeleton className="h-8 w-full" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1.5">
      <Form.Field
        name="email.sender"
        control={control}
        rules={{ required: 'Sender name is required' }}
        render={({ field }) => (
          <Form.Item>
            <Form.Label>
              {t('from')}
              <span className="text-destructive">*</span>
            </Form.Label>
            <Form.Control>
              <Input {...field} placeholder="Sales team" />
            </Form.Control>
            <Form.Message />
          </Form.Item>
        )}
      />

      {alignedFrom ? (
        <span className="px-1 text-xs text-muted-foreground">
          {senderName ? `${senderName} <${alignedFrom}>` : `<${alignedFrom}>`}
        </span>
      ) : (
        <Form.Field
          name="fromEmail"
          control={control}
          rules={{
            required: 'From address is required',
            validate: (value?: string) =>
              isEmail(value) || 'Enter a valid email address',
          }}
          render={({ field }) => (
            <Form.Item>
              <Form.Control>
                <Input {...field} placeholder="sales@yourdomain.com" />
              </Form.Control>
              <Form.Message />
            </Form.Item>
          )}
        />
      )}
    </div>
  );
};
