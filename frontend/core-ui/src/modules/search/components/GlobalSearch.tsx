import { GlobalSearchDialog } from '@/search/components/GlobalSearchDialog';
import {
  GLOBAL_SEARCH_MIN_LENGTH,
  useGlobalSearch,
} from '@/search/hooks/useGlobalSearch';
import { globalSearchOpenState } from '@/search/states/globalSearchState';
import { isMacPlatform } from '@/navigation/utils/visitedPageTabShortcuts';
import { useAtom } from 'jotai';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDebounce } from 'use-debounce';

const SEARCH_DEBOUNCE = 350;

// Mounted by the layout rather than by the tabs row, which unmounts when the
// row is hidden — the shortcut has to keep working there too.
export const GlobalSearch = () => {
  const navigate = useNavigate();

  const [open, setOpen] = useAtom(globalSearchOpenState);
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
  }, [setOpen]);

  const openResult = (path: string) => {
    setValue('');
    setOpen(false);
    navigate(path);
  };

  const isTyping = debouncedValue.length >= GLOBAL_SEARCH_MIN_LENGTH;
  const hasResults = groups.some((group) => group.items.length > 0);

  return (
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
  );
};
