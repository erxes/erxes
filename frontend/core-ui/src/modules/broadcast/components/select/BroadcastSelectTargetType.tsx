import { BROADCAST_TARGET_TYPE } from '@/broadcast/constants';
import { Form, Select } from 'erxes-ui';

export const BroadcastSelectTargetType = ({
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
          <Select.Value placeholder={'Select target type'}>
            {BROADCAST_TARGET_TYPE[value] || 'Select target type'}
          </Select.Value>
        </Select.Trigger>
      </Form.Control>
      <Select.Content>
        <Select.Group>
          {Object.entries(BROADCAST_TARGET_TYPE).map(([key, label]) => (
            <Select.Item key={key} className="text-xs h-7" value={key}>
              {label}
            </Select.Item>
          ))}
        </Select.Group>
      </Select.Content>
    </Select>
  );
};
