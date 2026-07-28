import { Button, DropdownMenu } from 'erxes-ui';
import {
  IconArchive,
  IconSortAscending,
  IconSortDescending,
} from '@tabler/icons-react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function ArchivedDeals() {
  const [searchParams, setSearchParams] = useSearchParams();
  const isArchivedMode = searchParams.get('archivedOnly') === 'true';
  const { t } = useTranslation('sales');
  const sortDir = (searchParams.get('archivedSort') || 'desc') as
    | 'asc'
    | 'desc';

  const handleToggle = () => {
    const params = new URLSearchParams(searchParams);

    if (isArchivedMode) {
      params.delete('archivedOnly');
      params.delete('archivedSort');
    } else {
      params.set('archivedOnly', 'true');
      params.set('archivedSort', 'desc');
    }

    setSearchParams(params, { replace: true });
  };

  const handleSortChange = (dir: 'asc' | 'desc') => {
    const params = new URLSearchParams(searchParams);
    params.set('archivedSort', dir);
    setSearchParams(params, { replace: true });
  };

  return (
    <div className="flex items-center">
      <Button
        variant={isArchivedMode ? 'secondary' : 'ghost'}
        onClick={handleToggle}
        className="gap-2"
      >
        <IconArchive size={18} />
        {isArchivedMode ? t('show-active-items') : t('show-archived-items')}
      </Button>

      {isArchivedMode && (
        <DropdownMenu>
          <DropdownMenu.Trigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="size-8 ml-1"
              title={t('sort-by-created-date')}
              aria-label={t('sort-by-created-date')}
            >
              {sortDir === 'asc' ? (
                <IconSortAscending size={16} />
              ) : (
                <IconSortDescending size={16} />
              )}
            </Button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Content align="end" className="w-52">
            <DropdownMenu.Label>{t('sort-by-created-date')}</DropdownMenu.Label>
            <DropdownMenu.Separator />
            <DropdownMenu.Item
              onClick={() => handleSortChange('desc')}
              className={sortDir === 'desc' ? 'text-primary' : ''}
            >
              <IconSortDescending className="size-4 mr-2" />
              {t('newest-first')}
              {sortDir === 'desc' && (
                <DropdownMenu.Shortcut>✓</DropdownMenu.Shortcut>
              )}
            </DropdownMenu.Item>
            <DropdownMenu.Item
              onClick={() => handleSortChange('asc')}
              className={sortDir === 'asc' ? 'text-primary' : ''}
            >
              <IconSortAscending className="size-4 mr-2" />
              {t('oldest-first')}
              {sortDir === 'asc' && (
                <DropdownMenu.Shortcut>✓</DropdownMenu.Shortcut>
              )}
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu>
      )}
    </div>
  );
}
