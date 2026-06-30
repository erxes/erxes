import { BROADCAST_TARGET_TYPE } from '@/broadcast/constants';
import { Form, Select } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

export const BroadcastSelectTargetType = ({
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
          <Select.Value placeholder={t('select-target-type', 'Select target type')}>
            {BROADCAST_TARGET_TYPE[value] || t('select-target-type', 'Select target type')}
          </Select.Value>
        </Select.Trigger>
      </Form.Control>
      <Select.Content>
        <Select.Group>
          {Object.entries(BROADCAST_TARGET_TYPE).map(([key, label]) => (
            <Select.Item
              key={key}
              className="text-xs h-7"
              value={key}
              disabled={key === 'segment' || key === 'brand'}
            >
              {label}
            </Select.Item>
          ))}
        </Select.Group>
      </Select.Content>
    </Select>
  );
};
