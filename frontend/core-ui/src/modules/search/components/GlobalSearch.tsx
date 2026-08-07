import { IconSearch } from '@tabler/icons-react';
import {
  GLOBAL_SEARCH_MIN_LENGTH,
  useGlobalSearch,
} from '@/search/hooks/useGlobalSearch';
import { GlobalSearchGroup } from '@/search/components/GlobalSearchGroup';
import {
  GlobalSearchEmpty,
  GlobalSearchFailure,
  GlobalSearchHint,
  GlobalSearchLoading,
} from '@/search/components/GlobalSearchStates';
import { isMacPlatform } from '@/navigation/utils/visitedPageTabShortcuts';
import { Button, cn, Command, Dialog } from 'erxes-ui';
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

  const { groups, loading, hasFailure, refetch } =
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

      <Dialog open={open} onOpenChange={setOpen}>
        <Dialog.Content className="max-w-md overflow-hidden rounded-lg border-0 p-0">
          <Dialog.Title className="sr-only">
            {t('placeholder', 'Search')}
          </Dialog.Title>
          <Dialog.Description className="sr-only">
            {t('placeholder', 'Search')}
          </Dialog.Description>
          <Command
            shouldFilter={false}
            className="**:[[cmdk-group-heading]]:px-2 **:[[cmdk-group-heading]]:font-medium **:[[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 **:[[cmdk-group]]:px-2"
          >
            <Command.Input
              focusOnMount
              variant="primary"
              placeholder={t('placeholder', 'Search')}
              value={value}
              onValueChange={setValue}
            />
            <Command.List className="styled-scroll min-h-32">
              {!isTyping && <GlobalSearchHint />}

              {isTyping && hasFailure && (
                <GlobalSearchFailure onRetry={() => refetch()} />
              )}

              {isTyping && !hasFailure && loading && !hasResults && (
                <GlobalSearchLoading />
              )}

              {isTyping && !hasFailure && !loading && !hasResults && (
                <GlobalSearchEmpty />
              )}

              {isTyping &&
                !hasFailure &&
                groups.map((group) => (
                  <GlobalSearchGroup
                    key={group.key}
                    group={group}
                    onSelect={openResult}
                  />
                ))}
            </Command.List>
          </Command>
        </Dialog.Content>
      </Dialog>
    </>
  );
};
