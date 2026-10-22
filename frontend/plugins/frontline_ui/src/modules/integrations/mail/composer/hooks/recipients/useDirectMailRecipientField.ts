import { useDirectMailRecipientControl } from '@/integrations/mail/composer/hooks/recipients/useDirectMailRecipientControl';
import { useDirectMailRecipientStateContext } from '@/integrations/mail/composer/hooks/recipients/useDirectMailRecipientStateContext';
import { useDirectMailRecipientSuggestions } from '@/integrations/mail/composer/hooks/recipients/useDirectMailRecipientSuggestions';
import { useDirectMailComposerContext } from '@/integrations/mail/composer/hooks/useDirectMailComposerFields';
import type { DirectMailRecipientFieldState } from '@/integrations/mail/composer/types/directMailRecipient';
import { splitAddresses } from '@/integrations/mail/composer/utils/directMailComposer';
import type { ChangeEvent, KeyboardEvent } from 'react';
import { z } from 'zod';

export const useDirectMailRecipientField =
  (): DirectMailRecipientFieldState => {
    const { name: fieldName, onChange: onValueChange } =
      useDirectMailRecipientControl();
    const { setRecipientCustomerId: onRecipientSelect } =
      useDirectMailComposerContext();
    const {
      focused,
      setFocused,
      setSuggestionsEnabled,
      draft,
      setDraft,
      selected,
      setSelected,
      searchValue,
      setSearchValue,
      activeEmail,
      setActiveEmail,
      listId,
      inputRef,
      lastEmitted,
    } = useDirectMailRecipientStateContext();

    const closeSuggestions = () => {
      setSuggestionsEnabled(false);
      setSearchValue('');
      setActiveEmail('');
    };

    const emit = (addresses: string[], text: string) => {
      const next = [...addresses, text.trim()].filter(Boolean).join(', ');
      lastEmitted.current = next;
      onValueChange(next);
    };

    const {
      options,
      showSuggestions,
      loading,
      error,
      refetch,
      loadMoreError,
      loadingMore,
      hasNextPage,
      listRef,
      sentinelRef,
      retryLoadMore,
    } = useDirectMailRecipientSuggestions();

    const selectEmail = (email: string, customerId?: string) => {
      closeSuggestions();
      const next = selected.some(
        (item) => item.toLowerCase() === email.toLowerCase(),
      )
        ? selected
        : [...selected, email];
      setSelected(next);
      setDraft('');
      emit(next, '');
      if (fieldName === 'to')
        onRecipientSelect(next.length === 1 ? customerId : undefined);
      inputRef.current?.focus();
    };

    const commitDraft = (focusInput = true) => {
      const addresses = splitAddresses(draft);
      if (
        !addresses.length ||
        addresses.some((email) => !z.string().email().safeParse(email).success)
      )
        return;
      const next = [...selected];
      for (const email of addresses) {
        if (!next.some((item) => item.toLowerCase() === email.toLowerCase()))
          next.push(email);
      }
      closeSuggestions();
      setSelected(next);
      setDraft('');
      emit(next, '');
      if (fieldName === 'to') onRecipientSelect(undefined);
      if (focusInput) inputRef.current?.focus();
    };

    const activeOptionIndex = options.findIndex(
      (option) => option.email === activeEmail,
    );

    const removeEmail = (email: string) => {
      const next = selected.filter((item) => item !== email);
      setSelected(next);
      emit(next, draft);
      if (fieldName === 'to') onRecipientSelect(undefined);
      inputRef.current?.focus();
    };

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
      const text = event.target.value;
      setFocused(true);
      setSuggestionsEnabled(Boolean(text.trim()));
      if (!text.trim()) setSearchValue('');
      if (text.endsWith(',') || text.endsWith(';')) {
        const email = text.slice(0, -1).trim();
        if (z.string().email().safeParse(email).success) {
          selectEmail(email);
          return;
        }
      }
      setDraft(text);
      emit(selected, text);
      if (fieldName === 'to') onRecipientSelect(undefined);
    };
    const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
      if (
        showSuggestions &&
        !loading &&
        options.length &&
        draft.trim() === searchValue &&
        (event.key === 'ArrowDown' || event.key === 'ArrowUp')
      ) {
        event.preventDefault();
        const current = options.findIndex(
          (option) => option.email === activeEmail,
        );
        let next = current <= 0 ? options.length - 1 : current - 1;
        if (event.key === 'ArrowDown') next = (current + 1) % options.length;
        setActiveEmail(options[next].email);
      } else if (
        event.key === 'Enter' &&
        showSuggestions &&
        !loading &&
        draft.trim() === searchValue &&
        options.length
      ) {
        event.preventDefault();
        const option =
          options.find((item) => item.email === activeEmail) ?? options[0];
        selectEmail(option.email, option.customerId);
      } else if (event.key === 'Enter' || event.key === 'Tab') {
        if (event.key === 'Enter') event.preventDefault();
        commitDraft(event.key !== 'Tab');
      } else if (event.key === 'Backspace' && !draft && selected.length) {
        removeEmail(selected[selected.length - 1]);
      } else if (event.key === 'Escape') closeSuggestions();
    };
    return {
      fieldName,
      focused,
      setFocused,
      draft,
      selected,
      activeEmail,
      setActiveEmail,
      listId,
      inputRef,
      options,
      showSuggestions,
      loading,
      error,
      refetch,
      loadMoreError,
      loadingMore,
      hasNextPage,
      listRef,
      sentinelRef,
      retryLoadMore,
      closeSuggestions,
      selectEmail,
      commitDraft,
      activeOptionIndex,
      removeEmail,
      handleChange,
      handleKeyDown,
    };
  };
