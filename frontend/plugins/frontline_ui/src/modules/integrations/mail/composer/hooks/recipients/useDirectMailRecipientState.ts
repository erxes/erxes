import { useDirectMailRecipientControl } from '@/integrations/mail/composer/hooks/recipients/useDirectMailRecipientControl';
import type { DirectMailRecipientStore } from '@/integrations/mail/composer/types/directMailRecipient';
import { splitAddresses } from '@/integrations/mail/composer/utils/directMailComposer';
import { useEffect, useId, useRef, useState } from 'react';
import { z } from 'zod';

export const useDirectMailRecipientState = (): DirectMailRecipientStore => {
  const { value } = useDirectMailRecipientControl();
  const [focused, setFocused] = useState(false);
  const [suggestionsEnabled, setSuggestionsEnabled] = useState(false);
  const [draft, setDraft] = useState('');
  const [selected, setSelected] = useState<string[]>([]);
  const [searchValue, setSearchValue] = useState('');
  const [activeEmail, setActiveEmail] = useState('');
  const listId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const lastEmitted = useRef<string>();

  useEffect(() => {
    if (value === lastEmitted.current) return;
    const addresses = splitAddresses(value);
    setSelected(
      addresses.filter(
        (address) => z.string().email().safeParse(address).success,
      ),
    );
    setDraft(
      addresses
        .filter((address) => !z.string().email().safeParse(address).success)
        .join(', '),
    );
  }, [value]);

  useEffect(() => {
    if (!focused || !suggestionsEnabled || !draft.trim()) return;
    const timer = window.setTimeout(() => setSearchValue(draft.trim()), 300);
    return () => window.clearTimeout(timer);
  }, [draft, focused, suggestionsEnabled]);

  const searchReady =
    focused &&
    suggestionsEnabled &&
    Boolean(draft.trim()) &&
    Boolean(searchValue);

  return {
    focused,
    setFocused,
    suggestionsEnabled,
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
    searchReady,
  };
};
