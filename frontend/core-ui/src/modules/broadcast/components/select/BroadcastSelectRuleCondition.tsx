import {
  BROADCAST_RULE_CONDITIONS,
  BROADCAST_RULES,
} from '@/broadcast/constants';
import { Form, Select } from 'erxes-ui';

export const BroadcastSelectRuleCondition = ({
  rule,
  value,
  onValueChange,
}: {
  rule: string;
  value: string;
  onValueChange: (value: string) => void;
}) => {
  const CONDITIONS = BROADCAST_RULE_CONDITIONS[rule];

  const { title } = BROADCAST_RULES[rule];

  return (
    <Select onValueChange={onValueChange} value={value}>
      <Form.Control>
        <Select.Trigger className="m-0">
          <Select.Value placeholder={'Select condition'}>
            {CONDITIONS[value] || 'Select condition'}
          </Select.Value>
        </Select.Trigger>
      </Form.Control>
      <Select.Content>
        <Select.Group>
          <Select.Label>{title}</Select.Label>
          {Object.entries(CONDITIONS).map(([key, label]) => (
            <Select.Item key={key} className="text-xs h-7" value={key}>
              {label}
            </Select.Item>
          ))}
        </Select.Group>
      </Select.Content>
    </Select>
  );
};
