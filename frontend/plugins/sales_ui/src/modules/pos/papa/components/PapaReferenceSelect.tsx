import { Select } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import {
  locationLabel,
  referenceLabel,
  TPapaReferenceRow,
} from '../utils/papaJson';

interface PapaReferenceSelectProps {
  rows: TPapaReferenceRow[];
  value?: string | null;
  onChange: (value: string) => void;
  placeholder: string;
  loading?: boolean;
  disabled?: boolean;
  /** Show locations as "parent › child". */
  nested?: boolean;
}

export const PapaReferenceSelect = ({
  rows,
  value,
  onChange,
  placeholder,
  loading,
  disabled,
  nested,
}: PapaReferenceSelectProps) => {
  const { t } = useTranslation('sales');
  const options = rows
    .map((row) => ({
      value: row.id,
      label: nested ? locationLabel(row, rows) : referenceLabel(row),
    }))
    .sort((a, b) => a.label.localeCompare(b.label));

  return (
    <Select
      value={value || undefined}
      onValueChange={onChange}
      disabled={disabled || loading}
    >
      <Select.Trigger>
        <Select.Value
          placeholder={loading ? t('loading', 'Loading...') : placeholder}
        />
      </Select.Trigger>
      <Select.Content>
        {options.length ? (
          options.map((option) => (
            <Select.Item key={option.value} value={option.value}>
              {option.label}
            </Select.Item>
          ))
        ) : (
          <div className="px-2 py-1.5 text-sm text-muted-foreground">
            {t('papa-no-options', 'Nothing to choose from')}
          </div>
        )}
      </Select.Content>
    </Select>
  );
};
