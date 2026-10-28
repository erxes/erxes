import { Form, Select } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useStructurePositions } from '../hooks/useStructurePositions';

export const StructurePositionSelect = ({
  value,
  onValueChange,
  disabled,
}: {
  value?: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'structure' });
  const { positions, loading, error } = useStructurePositions();

  return (
    <Select
      value={value || undefined}
      onValueChange={onValueChange}
      disabled={disabled || loading}
    >
      <Form.Control>
        <Select.Trigger>
          <Select.Value
            placeholder={loading ? t('loading') : t('select-position')}
          />
        </Select.Trigger>
      </Form.Control>
      <Select.Content>
        {error && (
          <p className="p-2 text-sm text-destructive">{error.message}</p>
        )}
        {!error && !positions.length && (
          <p className="p-2 text-sm text-muted-foreground">
            {t('no-positions')}
          </p>
        )}
        {positions.map((position) => (
          <Select.Item key={position._id} value={position._id}>
            {position.name}
          </Select.Item>
        ))}
      </Select.Content>
    </Select>
  );
};
