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
          <Select.Value placeholder={t('target-type.placeholder')}>
            {t(BROADCAST_TARGET_TYPE[value] || 'target-type.placeholder')}
          </Select.Value>
        </Select.Trigger>
      </Form.Control>
      <Select.Content>
        <Select.Group>
          {Object.entries(BROADCAST_TARGET_TYPE).map(([key, labelKey]) => (
            <Select.Item key={key} className="text-xs h-7" value={key}>
              {t(labelKey)}
            </Select.Item>
          ))}
        </Select.Group>
      </Select.Content>
    </Select>
  );
};
