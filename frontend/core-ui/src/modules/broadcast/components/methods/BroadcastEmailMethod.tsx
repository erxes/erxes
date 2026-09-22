import { SelectVerifiedSender } from '@/settings/mail-config/components/SelectVerifiedSender';
import { EmailSenderScopeProvider } from '@/settings/mail-config/contexts/EmailSenderScope';
import { useSenderOptions } from '@/settings/mail-config/hooks/useVerifiedSenders';
import { Form, Input } from 'erxes-ui';
import { useFormContext } from 'react-hook-form';
import { z } from 'zod';
import { BroadcastAttachment } from '../BroadcastAttachment';

const isEmail = (value?: string) =>
  !value || z.string().email().safeParse(value).success;

const ReplyToField = ({
  name,
  required,
}: {
  name: 'fromEmail' | 'email.replyTo';
  required?: boolean;
}) => {
  const { control, setValue } = useFormContext();

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
          <Form.Label>
            Reply to
            {required && <span className="text-destructive">*</span>}
          </Form.Label>
          <SelectVerifiedSender
            value={field.value}
            onChange={(value, sender) => {
              field.onChange(value);

              if (sender?.name) {
                setValue('email.sender', sender.name, { shouldDirty: true });
              }
            }}
            placeholder="Select a confirmed address"
          />
          <Form.Message />
        </Form.Item>
      )}
    />
  );
};

const BroadcastEmailFields = () => {
  const { control, watch } = useFormContext();
  const { alignedFrom } = useSenderOptions();

  const senderName = watch('email.sender');

  const pickedIsReplyTo = !!alignedFrom;

  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        {!alignedFrom && (
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
                <Form.Label>
                  From<span className="text-destructive">*</span>
                </Form.Label>
                <Form.Control>
                  <Input {...field} placeholder="sales@yourdomain.com" />
                </Form.Control>
                <Form.Message />
              </Form.Item>
            )}
          />
        )}

        {pickedIsReplyTo ? (
          <ReplyToField name="fromEmail" required />
        ) : (
          <ReplyToField name="email.replyTo" />
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Form.Field
          name="email.sender"
          control={control}
          rules={{ required: 'Sender name is required' }}
          render={({ field }) => (
            <Form.Item>
              <Form.Label>
                Sender name<span className="text-destructive">*</span>
              </Form.Label>
              <Form.Control>
                <Input {...field} placeholder="Sales team" />
              </Form.Control>
              {alignedFrom && (
                <Form.Description>
                  {senderName
                    ? `${senderName} <${alignedFrom}>`
                    : `<${alignedFrom}>`}
                </Form.Description>
              )}
              <Form.Message />
            </Form.Item>
          )}
        />

        <Form.Field
          name="email.subject"
          control={control}
          rules={{ required: 'Email subject is required' }}
          render={({ field }) => (
            <Form.Item>
              <Form.Label>
                Subject<span className="text-destructive">*</span>
              </Form.Label>
              <Form.Control>
                <Input {...field} placeholder="Subject" />
              </Form.Control>
              <Form.Message />
            </Form.Item>
          )}
        />
      </div>

      <Form.Field
        name="email.attachments"
        control={control}
        render={({ field }) => (
          <Form.Item className="h-full overflow-hidden">
            <Form.Label>Attachments</Form.Label>
            <Form.Control>
              <BroadcastAttachment {...field} />
            </Form.Control>
          </Form.Item>
        )}
      />
    </>
  );
};

export const BroadcastEmailMethod = () => (
  <EmailSenderScopeProvider scope="broadcast">
    <form className="flex flex-col h-full gap-3">
      <BroadcastEmailFields />
    </form>
  </EmailSenderScopeProvider>
);
