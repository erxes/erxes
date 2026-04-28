import { TagsListHead } from '@/settings/tags/components/TagsListCell';
import { Checkbox } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

interface TagTreeTableHeaderProps {
  allSelected: boolean;
  someSelected: boolean;
  onToggleAll: () => void;
}

export const TagTreeTableHeader = ({
  allSelected,
  someSelected,
  onToggleAll,
}: TagTreeTableHeaderProps) => {
  const { t } = useTranslation('settings', { keyPrefix: 'tags' });
  return (
    <div className="h-7 w-full flex items-center px-2 pb-2">
      <div className="w-10 flex items-center justify-center shrink-0">
        <Checkbox
          checked={allSelected ? true : someSelected ? 'indeterminate' : false}
          onCheckedChange={onToggleAll}
          aria-label="Select all"
        />
      </div>
      <TagsListHead className="flex-1 min-w-0 pl-2">{t('name')}</TagsListHead>
      <TagsListHead className="flex-1 max-md:hidden pl-2">
        {t('description')}
      </TagsListHead>
      <TagsListHead className="w-32 max-sm:hidden">
        {t('created-at')}
      </TagsListHead>
      <div className="w-10 shrink-0" />
    </div>
  );
};
