import { Select } from 'erxes-ui';
import { useFieldGroups, useFields } from 'ui-modules';

interface FilterFieldSelectProps {
  value: string;
  onValueChange: (value: string) => void;
}

export const FilterFieldSelect = ({
  value,
  onValueChange,
}: FilterFieldSelectProps) => {
  const { fieldGroups } = useFieldGroups({
    contentType: 'core:product',
  });

  return (
    <Select value={value || undefined} onValueChange={onValueChange}>
      <Select.Trigger>
        <Select.Value placeholder="Select field" />
      </Select.Trigger>
      <Select.Content>
        {fieldGroups.map((group) => (
          <FieldGroupSection
            key={group._id}
            groupId={group._id}
            groupName={group.name}
          />
        ))}
      </Select.Content>
    </Select>
  );
};

const FieldGroupSection = ({
  groupId,
  groupName,
}: {
  groupId: string;
  groupName: string;
}) => {
  const { fields } = useFields({
    contentType: 'core:product',
    groupId,
  });

  if (!fields.length) return null;

  return (
    <Select.Group>
      <Select.Label className="text-muted-foreground">{groupName}</Select.Label>
      {fields.map((field) => (
        <Select.Item key={field._id} value={field._id}>
          {field.name}
        </Select.Item>
      ))}
    </Select.Group>
  );
};
