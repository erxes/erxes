import { BROADCAST_MESSENGER_MESSAGE_TYPES } from '@/broadcast/constants';
import { Form, Select } from 'erxes-ui';

export const BroadcastSelectMessengerMessageType = ({
  value,
  onValueChange,
}: {
  value: string;
  onValueChange: (value: string) => void;
}) => {
  return (
    <Select onValueChange={onValueChange} value={value}>
      <Form.Control>
        <Select.Trigger>
          <Select.Value placeholder={'Select message type'}>
            {BROADCAST_MESSENGER_MESSAGE_TYPES[value] || 'Select message type'}
          </Select.Value>
        </Select.Trigger>
      </Form.Control>
      <Select.Content>
        <Select.Group>
          {Object.entries(BROADCAST_MESSENGER_MESSAGE_TYPES).map(
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
