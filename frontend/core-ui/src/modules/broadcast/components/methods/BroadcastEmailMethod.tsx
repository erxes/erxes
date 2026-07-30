import { SelectVerifiedSender } from '@/settings/mail-config/components/SelectVerifiedSender';
import { EmailSenderScopeProvider } from '@/settings/mail-config/contexts/EmailSenderScope';
import { Form, Input } from 'erxes-ui';
import { useFormContext } from 'react-hook-form';
import { z } from 'zod';
import { BroadcastAttachment } from '../BroadcastAttachment';

export const BroadcastEmailMethod = () => {
  const { control } = useFormContext();

  return (
    <form className="flex flex-col h-full gap-3">
      <div className="grid grid-cols-2 gap-3">
        <Form.Field
          name="fromEmail"
          control={control}
          rules={{ required: 'From sender is required' }}
          render={({ field }) => (
            <Form.Item>
              <Form.Label>From sender</Form.Label>
              <Form.Control>
                <EmailSenderScopeProvider scope="broadcast">
                  <SelectVerifiedSender
                    value={field.value}
                    onChange={field.onChange}
                  />
                </EmailSenderScopeProvider>
              </Form.Control>
            </Form.Item>
          )}
        />

        <Form.Field
          name="email.subject"
          control={control}
          rules={{ required: 'Email subject is required' }}
          render={({ field }) => (
            <Form.Item>
              <Form.Label>Email Subject</Form.Label>
              <Form.Control>
                <Input {...field} placeholder="Subject" />
              </Form.Control>
            </Form.Item>
          )}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Form.Field
          name="email.sender"
          control={control}
          render={({ field }) => (
            <Form.Item>
              <Form.Label>Sender</Form.Label>
              <Form.Control>
                <Input {...field} placeholder="Sender" />
              </Form.Control>
            </Form.Item>
          )}
        />
        <Form.Field
          name="email.replyTo"
          control={control}
          rules={{
            // Providers reject a malformed reply-to outright, so catching it
            // here is the difference between a form error and a failed campaign.
            validate: (value?: string) =>
              !value ||
              z.string().email().safeParse(value).success ||
              'Enter a valid email address',
          }}
          render={({ field }) => (
            <Form.Item>
              <Form.Label>Reply To</Form.Label>
              <Form.Control>
                <Input {...field} placeholder="Reply To" />
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
    </form>
  );
};
