import { Select } from 'erxes-ui';
import { useFields } from 'ui-modules';

interface RuleFieldSelectProps {
  groupId: string;
  value: string;
  onValueChange: (value: string) => void;
}

export const RuleFieldSelect = ({
  groupId,
  value,
  onValueChange,
}: RuleFieldSelectProps) => {
  const { fields } = useFields({
    contentType: 'core:product',
    groupId: groupId || undefined,
  });

  return (
    <Select value={value} onValueChange={onValueChange}>
      <Select.Trigger className="flex-1">
        <Select.Value placeholder="Select field" />
      </Select.Trigger>
      <Select.Content>
        {fields.map((field) => (
          <Select.Item key={field._id} value={field._id}>
            {field.name}
          </Select.Item>
        ))}
      </Select.Content>
    </Select>
  );
};
