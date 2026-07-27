import { BROADCAST_MESSENGER_SENT_AS_TYPES } from '@/broadcast/constants';
import { Form, Select } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

export const BroadcastSelectMessengerMessageSentAs = ({
  value,
  onValueChange,
}: {
  value: string;
  onValueChange: (value: string) => void;
}) => {
  const { t } = useTranslation('broadcasts');
  return (
    <Select onValueChange={onValueChange} value={value}>
      <Form.Control>
        <Select.Trigger>
          <Select.Value placeholder={t('select-sent-as', 'Select sent as')}>
            {BROADCAST_MESSENGER_SENT_AS_TYPES[value] || t('select-sent-as', 'Select sent as')}
          </Select.Value>
        </Select.Trigger>
      </Form.Control>
      <Select.Content>
        <Select.Group>
          {Object.entries(BROADCAST_MESSENGER_SENT_AS_TYPES).map(
            ([key, label]) => (
              <Select.Item key={key} className="text-xs h-7" value={key}>
                {label}
              </Select.Item>
            ),
          )}
        </Select.Group>
      </Select.Content>
    </Select>
  );
};
