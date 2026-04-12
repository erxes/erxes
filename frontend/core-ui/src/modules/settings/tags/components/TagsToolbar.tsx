import { ActiveFilter } from '@/settings/tags/types/tagTree';
import { IconSearch } from '@tabler/icons-react';
import { Button, cn, Input } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

interface TagsToolbarProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  activeFilter: ActiveFilter;
  onFilterChange: (filter: ActiveFilter) => void;
}

const FILTERS: { value: ActiveFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'groups', label: 'Groups' },
  { value: 'standalone', label: 'Standalone' },
  { value: 'child', label: 'Child' },
];

export const TagsToolbar = ({
  searchTerm,
  onSearchChange,
  activeFilter,
  onFilterChange,
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
      <div className="flex items-center gap-1">
        {FILTERS.map((f) => (
          <Button
            key={f.value}
            variant={activeFilter === f.value ? 'secondary' : 'ghost'}
            size="sm"
            className={cn(
              'h-7 text-xs px-2.5',
              activeFilter === f.value && 'font-medium',
            )}
            onClick={() => onFilterChange(f.value)}
          >
            {f.label}
          </Button>
        ))}
      </div>
    </div>
  );
};
