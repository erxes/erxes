import { Select } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useFieldGroups } from 'ui-modules';

interface RuleGroupSelectProps {
  value: string;
  onValueChange: (value: string) => void;
}

export const RuleGroupSelect = ({
  value,
  onValueChange,
}: RuleGroupSelectProps) => {
  const { t } = useTranslation('product', { keyPrefix: 'similarity-config' });
  const { fieldGroups } = useFieldGroups({
    contentType: 'core:product',
  });

  return (
    <>
      <Select value={value} onValueChange={onValueChange}>
        <Select.Trigger className="flex-1">
          <Select.Value placeholder={t('select-group', 'Select group')} />
        </Select.Trigger>
        <Select.Content>
          {fieldGroups.map((group) => (
            <Select.Item key={group._id} value={group._id}>
              {group.name}
            </Select.Item>
          ))}
        </Select.Content>
      </Select>
    </>
  );
};
