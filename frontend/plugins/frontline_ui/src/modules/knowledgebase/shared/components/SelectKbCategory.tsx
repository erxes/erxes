import {
  Combobox,
  Command,
  PopoverScoped,
  RecordTableInlineCell,
  TextOverflowTooltip,
} from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useCategories } from '@/knowledgebase/categories/hooks/useCategories';

export const SelectKbCategory = ({
  topicId,
  value,
  onValueChange,
  variant = 'form',
  scope,
  excludeId,
  allowEmpty,
  placeholder,
}: {
  topicId: string;
  value?: string;
  onValueChange: (categoryId: string) => void;
  variant?: 'form' | 'table';
  scope?: string;
  excludeId?: string;
  allowEmpty?: boolean;
  placeholder?: string;
}) => {
  const { t } = useTranslation('frontline');
  const [open, setOpen] = useState(false);
  const { categories, loading } = useCategories(topicId);

  const options = (categories ?? []).filter(
    (category) => category._id !== excludeId,
  );
  const selected = options.find((category) => category._id === value);
  const label =
    selected?.title ||
    placeholder ||
    t('kb-select-category', 'Select a category');

  const handleSelect = (categoryId: string) => {
    onValueChange(categoryId);
    setOpen(false);
  };

  return (
    <PopoverScoped scope={scope} open={open} onOpenChange={setOpen}>
      {variant === 'table' ? (
        <RecordTableInlineCell.Trigger>
          <TextOverflowTooltip value={label} />
        </RecordTableInlineCell.Trigger>
      ) : (
        <Combobox.Trigger className="w-full h-8 font-medium">
          <TextOverflowTooltip value={label} />
        </Combobox.Trigger>
      )}
      <Combobox.Content>
        <Command>
          <Command.Input
            placeholder={t('kb-search-categories', 'Search categories')}
          />
          <Command.List>
            <Combobox.Empty loading={loading} />
            {allowEmpty && (
              <Command.Item value="" onSelect={() => handleSelect('')}>
                {t('kb-no-parent-category', 'No parent category')}
                <Combobox.Check checked={!value} />
              </Command.Item>
            )}
            {options.map((category) => (
              <Command.Item
                key={category._id}
                value={category.title}
                onSelect={() => handleSelect(category._id)}
              >
                <TextOverflowTooltip
                  value={category.title || t('unnamed-category')}
                />
                <Combobox.Check checked={value === category._id} />
              </Command.Item>
            ))}
          </Command.List>
        </Command>
      </Combobox.Content>
    </PopoverScoped>
  );
};
