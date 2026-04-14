import { Form, Input } from 'erxes-ui';
import { useFormContext } from 'react-hook-form';
import { BroadcastAttachment } from '../BroadcastAttachment';
import { SelectBroadcastMember } from '../select/BroadcastSelectMember';

export const BroadcastEmailMethod = () => {
  const { control } = useFormContext();

  return (
    <form className="flex flex-col h-full gap-3">
      <div className="grid grid-cols-2 gap-3">
        <Form.Field
          name="fromUserId"
          control={control}
          rules={{ required: 'From user is required' }}
          render={({ field }) => (
            <Form.Item>
              <Form.Label>From User</Form.Label>
              <Form.Control>
                <SelectBroadcastMember.FormItem
                  value={field.value}
                  onValueChange={field.onChange}
                  placeholder="Select team members"
                  variables={{ isVerified: true }}
                />
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
          render={({ field }) => (
            <Form.Item>
              <Form.Label>Reply To</Form.Label>
              <Form.Control>
                <Input {...field} placeholder="Reply To" />
              </Form.Control>
            </Form.Item>
          )}
        />
      </div>

      <Form.Field
        name="email.attachments"
        control={control}
        render={({ field }) => (
          <Form.Item className='h-full overflow-hidden'>
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
