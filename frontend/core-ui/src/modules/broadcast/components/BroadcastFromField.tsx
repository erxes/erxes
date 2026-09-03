import { SelectVerifiedSender } from '@/settings/mail-config/components/SelectVerifiedSender';
import { useSenderOptions } from '@/settings/mail-config/hooks/useVerifiedSenders';
import { Form, Input } from 'erxes-ui';
import { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';

const isEmail = (value?: string) =>
  !value || z.string().email().safeParse(value).success;

const ReplyToField = ({
  name,
  required,
}: {
  name: 'fromEmail' | 'email.replyTo';
  required?: boolean;
}) => {
  const { control } = useFormContext();

  return (
    <Form.Field
      name={name}
      control={control}
      rules={{
        required: required ? 'Reply-to address is required' : undefined,
        validate: (value?: string) =>
          isEmail(value) || 'Enter a valid email address',
      }}
      render={({ field }) => (
        <Form.Item>
          <Form.Control>
            <SelectVerifiedSender
              value={field.value}
              onChange={field.onChange}
              placeholder="Select a confirmed address"
            />
          </Form.Control>
          <Form.Message />
        </Form.Item>
      )}
    />
  );
};

export const BroadcastFromField = () => {
  const { control } = useFormContext();
  const { alignedFrom } = useSenderOptions();
  const { t } = useTranslation('broadcasts', { keyPrefix: 'composer' });

  const [showReplyTo, setShowReplyTo] = useState(false);

  const pickedIsReplyTo = !!alignedFrom;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-4">
        <span className="w-20 shrink-0 text-sm text-muted-foreground">
          {t('from')}
        </span>

        <div className="flex-1 flex items-center gap-1">
          <Form.Field
            name="email.sender"
            control={control}
            rules={{ required: 'Sender name is required' }}
            render={({ field }) => (
              <Form.Item className="flex-1">
                <Form.Control>
                  <Input
                    {...field}
                    placeholder="Sales team"
                    className="border-none shadow-none px-0 focus-visible:ring-0"
                  />
                </Form.Control>
                <Form.Message />
              </Form.Item>
            )}
          />

          {alignedFrom ? (
            <span className="text-muted-foreground text-sm shrink-0">
              &lt;{alignedFrom}&gt;
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
                <Form.Item className="flex-1">
                  <Form.Control>
                    <Input
                      {...field}
                      placeholder="sales@yourdomain.com"
                      className="border-none shadow-none px-0 focus-visible:ring-0"
                    />
                  </Form.Control>
                  <Form.Message />
                </Form.Item>
              )}
            />
          )}
        </div>

        <button
          type="button"
          onClick={() => setShowReplyTo((v) => !v)}
          className="shrink-0 text-sm text-muted-foreground hover:text-foreground"
        >
          {t('replyTo')}
        </button>
      </div>

      {showReplyTo &&
        (pickedIsReplyTo ? (
          <ReplyToField name="fromEmail" required />
        ) : (
          <ReplyToField name="email.replyTo" />
        ))}
    </div>
  );
};
