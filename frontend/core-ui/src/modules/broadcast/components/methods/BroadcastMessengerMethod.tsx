import { Form } from 'erxes-ui';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { SelectBrand, SelectMember } from 'ui-modules';
import { BroadcastRules } from '../BroadcastRules';
import { BroadcastSelectMessengerMessageSentAs } from '../select/BroadcastSelectMessengerMessageSentAs';
import { BroadcastSelectMessengerMessageType } from '../select/BroadcastSelectMessengerMessageType';

export const BroadcastMessengerMethod = () => {
  const { t } = useTranslation('broadcasts');
  const { control } = useFormContext();

  return (
    <form className="flex flex-col h-full gap-3">
      <div className="grid grid-cols-2 gap-3">
        <Form.Field
          name="fromUserId"
          control={control}
          render={({ field }) => (
            <Form.Item>
              <Form.Label>{t('from-user', 'From User')}</Form.Label>
              <Form.Control>
                <SelectMember.FormItem
                  value={field.value}
                  onValueChange={field.onChange}
                  placeholder={t('select-team-members', 'Select team members')}
                />
              </Form.Control>
            </Form.Item>
          )}
        />
        <Form.Field
          name="messenger.brandId"
          control={control}
          render={({ field }) => (
            <Form.Item>
              <Form.Label>{t('brand', 'Brand')}</Form.Label>
              <Form.Control>
                <SelectBrand.FormItem
                  value={field.value}
                  onValueChange={field.onChange}
                  placeholder={t('select-brand', 'Select brand')}
                />
              </Form.Control>
            </Form.Item>
          )}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Form.Field
          name="messenger.kind"
          control={control}
          render={({ field }) => (
            <Form.Item>
              <Form.Label>{t('message-type', 'Message type')}</Form.Label>
              <Form.Control>
                <BroadcastSelectMessengerMessageType
                  value={field.value}
                  onValueChange={field.onChange}
                />
              </Form.Control>
            </Form.Item>
          )}
        />
        <Form.Field
          name="messanger.sentAs"
          control={control}
          render={({ field }) => (
            <Form.Item>
              <Form.Label>{t('sent-as', 'Sent as')}</Form.Label>
              <Form.Control>
                <BroadcastSelectMessengerMessageSentAs
                  value={field.value}
                  onValueChange={field.onChange}
                />
              </Form.Control>
            </Form.Item>
          )}
        />
      </div>

      <BroadcastRules />
    </form>
  );
};
