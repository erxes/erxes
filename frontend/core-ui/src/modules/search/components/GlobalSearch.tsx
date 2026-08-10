import { IconSearch } from '@tabler/icons-react';
import {
  GLOBAL_SEARCH_MIN_LENGTH,
  useGlobalSearch,
} from '@/search/hooks/useGlobalSearch';
import { GlobalSearchDialog } from '@/search/components/GlobalSearchDialog';
import { isMacPlatform } from '@/navigation/utils/visitedPageTabShortcuts';
import { Button, cn } from 'erxes-ui';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useDebounce } from 'use-debounce';

const SEARCH_DEBOUNCE = 350;

const GlobalSearchTrigger = ({
  className,
  label,
  onClick,
}: {
  className?: string;
  label: string;
  onClick: () => void;
}) => {
  const isMac = isMacPlatform();

  return (
    <Button
      aria-keyshortcuts={isMac ? 'Meta+Alt+K' : 'Control+Alt+K'}
      aria-label={label}
      className={cn('size-8 shrink-0 text-muted-foreground', className)}
      onClick={onClick}
      size="icon"
      title={`${label} (${isMac ? '⌘ ⌥ K' : 'Ctrl Alt K'})`}
      type="button"
      variant="ghost"
    >
      <IconSearch className="size-4" />
    </Button>
  );
};

export const GlobalSearch = ({ className }: { className?: string }) => {
  const { t } = useTranslation('common', { keyPrefix: 'global-search' });
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const [value, setValue] = useState('');
  const [debouncedValue] = useDebounce(value.trim(), SEARCH_DEBOUNCE);

  const { groups, totalCount, loading, hasFailure, refetch } =
    useGlobalSearch(debouncedValue);

  useEffect(() => {
    const handleOpenSearch = (event: KeyboardEvent) => {
      const hasSearchModifier = isMacPlatform()
        ? event.metaKey && !event.ctrlKey
        : event.ctrlKey && !event.metaKey;

      if (
        hasSearchModifier &&
        event.altKey &&
        !event.shiftKey &&
        event.code === 'KeyK'
      ) {
        event.preventDefault();
        setOpen(true);
      }
    };

    window.addEventListener('keydown', handleOpenSearch);

    return () => window.removeEventListener('keydown', handleOpenSearch);
  }, []);

  const openResult = (path: string) => {
    setValue('');
    setOpen(false);
    navigate(path);
  };

  const isTyping = debouncedValue.length >= GLOBAL_SEARCH_MIN_LENGTH;
  const hasResults = groups.some((group) => group.items.length > 0);

  return (
    <>
      <GlobalSearchTrigger
        className={className}
        label={t('placeholder', 'Search')}
        onClick={() => setOpen(true)}
      />

      <GlobalSearchDialog
        open={open}
        onOpenChange={setOpen}
        value={value}
        onValueChange={setValue}
        isTyping={isTyping}
        hasFailure={hasFailure}
        loading={loading}
        hasResults={hasResults}
        groups={groups}
        totalCount={totalCount}
        searchValue={debouncedValue}
        onSelect={openResult}
        onRetry={() => refetch()}
      />
    </>
  );
};
