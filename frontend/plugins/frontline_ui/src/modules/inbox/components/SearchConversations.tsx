import { IconSearch, IconX } from '@tabler/icons-react';
import { Button, Input, useQueryState } from 'erxes-ui';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDebouncedCallback } from 'use-debounce';

const SEARCH_DELAY = 300;

export const SearchConversations = () => {
  const { t } = useTranslation('frontline');
  const [searchValue, setSearchValue] = useQueryState<string>('searchValue');
  const [draft, setDraft] = useState(searchValue ?? '');
  const commitSearch = useDebouncedCallback((value: string) => {
    const normalizedValue = value.trim();
    setSearchValue(normalizedValue || null);
  }, SEARCH_DELAY);

  useEffect(() => {
    setDraft(searchValue ?? '');
  }, [searchValue]);

  useEffect(() => () => commitSearch.cancel(), [commitSearch]);

  const clearSearch = () => {
    commitSearch.cancel();
    setDraft('');
    setSearchValue(null);
  };

  return (
    <div className="relative">
      <IconSearch className="pointer-events-none absolute left-2 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        aria-label={t('search')}
        className="h-8 pl-8 pr-8 text-xs"
        onChange={(event) => {
          setDraft(event.currentTarget.value);
          commitSearch(event.currentTarget.value);
        }}
        placeholder={t('search')}
        type="search"
        value={draft}
        variant="secondary"
      />
      {draft && (
        <Button
          aria-label={t('reset-filters')}
          className="absolute right-0.5 top-1/2 size-7 -translate-y-1/2 text-muted-foreground"
          onClick={clearSearch}
          size="icon"
          variant="ghost"
        >
          <IconX className="size-3.5" />
        </Button>
      )}
    </div>
  );
};
