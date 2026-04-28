import { IconSearch } from '@tabler/icons-react';
import { Input } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

interface TagsToolbarProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
}

export const TagsToolbar = ({
  searchTerm,
  onSearchChange,
}: TagsToolbarProps) => {
  const { t } = useTranslation('settings', { keyPrefix: 'tags' });

  return (
    <div className="flex items-center gap-2 px-3 py-2">
      <div className="relative max-w-xs w-full">
        <IconSearch className="size-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
        <Input
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={t('search') || 'Search tags...'}
          className="pl-8 h-8 text-sm"
        />
      </div>
    </div>
  );
};
