import { ToggleGroup } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { ProductConditionCodesMode } from './types';

export const ConditionModeToggle = ({
  value,
  onChange,
}: {
  value: ProductConditionCodesMode;
  onChange: (mode: ProductConditionCodesMode) => void;
}) => {
  const { t } = useTranslation('product');

  return (
    <ToggleGroup
      type="single"
      variant="outline"
      value={value}
      // Radix sends '' when the active item is clicked again; keep the choice.
      onValueChange={(mode) =>
        mode && onChange(mode as ProductConditionCodesMode)
      }
    >
      <ToggleGroup.Item value="add">
        {t('condition-mode-add', 'Add')}
      </ToggleGroup.Item>
      <ToggleGroup.Item value="remove">
        {t('condition-mode-remove', 'Remove')}
      </ToggleGroup.Item>
    </ToggleGroup>
  );
};
