import { Form, Input } from 'erxes-ui';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { BroadcastAttachment } from '../BroadcastAttachment';
import { SelectBroadcastMember } from '../select/BroadcastSelectMember';

export const BroadcastEmailMethod = () => {
  const { t } = useTranslation('broadcasts');
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
              <Form.Label>{t('from-user', 'From User')}</Form.Label>
              <Form.Control>
                <SelectBroadcastMember.FormItem
                  value={field.value}
                  onValueChange={field.onChange}
                  placeholder={t('select-team-members', 'Select team members')}
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
              <Form.Label>{t('email-subject', 'Email Subject')}</Form.Label>
              <Form.Control>
                <Input {...field} placeholder={t('subject', 'Subject')} />
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
              <Form.Label>{t('sender', 'Sender')}</Form.Label>
              <Form.Control>
                <Input {...field} placeholder={t('sender', 'Sender')} />
              </Form.Control>
            </Form.Item>
          )}
        />
        <Form.Field
          name="email.replyTo"
          control={control}
          render={({ field }) => (
            <Form.Item>
              <Form.Label>{t('reply-to', 'Reply To')}</Form.Label>
              <Form.Control>
                <Input {...field} placeholder={t('reply-to', 'Reply To')} />
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
            <Form.Label>{t('attachments', 'Attachments')}</Form.Label>
            <Form.Control>
              <BroadcastAttachment {...field} />
            </Form.Control>
          </Form.Item>
        )}
      />
    </form>
  );
};
