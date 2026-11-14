import { Combobox, Popover } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { SelectTags } from 'ui-modules';

interface ProductTagSelectProps {
  value: string[];
  onValueChange: (value: string[]) => void;
}

export const ProductTagSelect = ({
  value,
  onValueChange,
}: ProductTagSelectProps) => {
  const { t } = useTranslation('sales');
  return (
    <SelectTags.Provider
      tagType="core:product"
      mode="multiple"
      value={value}
      onValueChange={(next) =>
        onValueChange(Array.isArray(next) ? next : next ? [next] : [])
      }
    >
      <Popover>
        <Combobox.Trigger>
          <SelectTags.Value placeholder={t('select-tags')} />
        </Combobox.Trigger>
        <Combobox.Content>
          <SelectTags.Command disableCreateOption />
        </Combobox.Content>
      </Popover>
    </SelectTags.Provider>
  );
};
