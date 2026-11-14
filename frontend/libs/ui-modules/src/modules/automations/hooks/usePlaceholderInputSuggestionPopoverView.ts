import { ForwardedRef, useEffect, useMemo, useState } from 'react';
import { useDebounce } from 'use-debounce';
import { usePlaceholderInputContext } from '../contexts/PlaceholderInputContext';
import { usePlaceholderInputSuggestionPopover } from './usePlaceholderInputSuggestionPopover';
import { usePopoverPosition } from './usePopoverPosition';

const SEARCH_DEBOUNCE_MS = 250;

// Lists fetched by search rather than filtered in place
const SERVER_FILTERED_TYPES = [
  'call_user',
  'call_customer',
  'call_company',
  'call_product',
  'call_tag',
];

type TPopoverPosition = 'left' | 'right' | 'top' | 'bottom';

/**
 * The suggestion popover beside a placeholder input: which list it shows,
 * where it sits, and its own search, started from what was typed after the
 * trigger and sent to the server once typing pauses.
 */
export const usePlaceholderInputSuggestionPopoverView = ({
  popoverRef,
  searchQuery,
  onClose,
  popoverPosition,
}: {
  popoverRef: ForwardedRef<HTMLDivElement>;
  searchQuery: string;
  onClose: () => void;
  popoverPosition: TPopoverPosition;
}) => {
  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebounce(search, SEARCH_DEBOUNCE_MS);
  const { inputRef } = usePlaceholderInputContext();
  const popover = usePlaceholderInputSuggestionPopover({
    popoverRef: popoverRef as
      | React.MutableRefObject<HTMLDivElement | null>
      | undefined,
    searchQuery,
    onClose,
  });
  const {
    type,
    isOpenPopover,
    internalRef,
    suggestionOptions,
    suggestionConfig,
  } = popover;
  const title = suggestionConfig?.title || 'Suggestions';

  const positionStyle = usePopoverPosition({
    position: popoverPosition,
    inputRef,
    popoverRef: internalRef,
    isOpen: isOpenPopover,
  });

  useEffect(() => {
    setSearch(isOpenPopover ? searchQuery || '' : '');
  }, [isOpenPopover, searchQuery, type]);

  const remoteSearchValue = useMemo(
    () => (debouncedSearch || searchQuery || '').trim(),
    [debouncedSearch, searchQuery],
  );

  return {
    ...popover,
    title,
    trigger: suggestionConfig?.trigger,
    selectFieldName: suggestionOptions?.selectFieldName || '_id',
    positionStyle,
    search,
    setSearch,
    searchPlaceholder: `Search ${title.toLowerCase()}...`,
    remoteSearchValue,
    isServerFiltered: SERVER_FILTERED_TYPES.includes(type),
  };
};
