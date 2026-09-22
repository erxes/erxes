import { useCallback, useEffect, useMemo, useState } from 'react';
import { stripHtml, toast, type useBlockEditor } from 'erxes-ui';
import { useDebounce } from 'use-debounce';
import { useTranslation } from 'react-i18next';
import type { Block } from '@blocknote/core';

import { useGetChannels } from '@/channels/hooks/useGetChannels';
import { getPreviewText } from '@/inbox/types/inbox';
import { useGetResponses } from '@/responseTemplate/hooks/useGetResponses';

type MessageEditor = ReturnType<typeof useBlockEditor>;

/** Builds and controls response-template suggestions for the composer editor. */
export const useResponseTemplateSuggestions = (editor: MessageEditor) => {
  const { t } = useTranslation('frontline');
  const { channels: availableChannels } = useGetChannels();
  const [searchValue, setSearchValue] = useState('');
  const [debouncedSearchValue] = useDebounce(searchValue, 300);
  const { responses } = useGetResponses({
    skip: !debouncedSearchValue,
    variables: {
      filter: { searchValue: debouncedSearchValue || undefined },
    },
  });
  const preparedResponses = useMemo(
    () =>
      (responses || []).map((response) => ({
        ...response,
        preview: getPreviewText(response.content || ''),
      })),
    [responses],
  );
  const [suggestions, setSuggestions] = useState(preparedResponses);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [responseTemplateId, setResponseTemplateId] = useState<string | null>(
    null,
  );

  /** Replaces the editor content with the selected response template. */
  const handleTemplateSelect = useCallback(
    async (templateContent: string, templateId?: string) => {
      try {
        let blocksToInsert: Block[];

        try {
          const parsed: unknown = JSON.parse(templateContent);
          blocksToInsert = Array.isArray(parsed)
            ? (parsed as Block[])
            : [{ type: 'paragraph', content: templateContent, props: {} }];
        } catch {
          blocksToInsert = [
            {
              type: 'paragraph',
              content: stripHtml(templateContent).trim(),
              props: {},
            },
          ];
        }

        await editor.replaceBlocks(editor.document, blocksToInsert);
        await editor.focus();
        setShowSuggestions(false);
        setResponseTemplateId(templateId || null);
      } catch {
        toast({
          title: t('failed-to-insert-template', 'Failed to insert template'),
          variant: 'destructive',
        });
      }
    },
    [editor, t],
  );

  /** Handles keyboard navigation while template suggestions are open. */
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (!showSuggestions) return;

      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault();
        setSelectedIndex((current) =>
          event.key === 'ArrowDown'
            ? Math.min(current + 1, suggestions.length - 1)
            : Math.max(current - 1, 0),
        );
      } else if (event.key === 'Enter') {
        event.preventDefault();
        const suggestion = suggestions[selectedIndex];
        if (suggestion) {
          handleTemplateSelect(suggestion.content, suggestion._id);
          setShowSuggestions(false);
        }
      } else if (event.key === 'Escape') {
        event.preventDefault();
        setShowSuggestions(false);
      }
    },
    [handleTemplateSelect, selectedIndex, showSuggestions, suggestions],
  );

  useEffect(() => setSelectedIndex(-1), [suggestions]);
  useEffect(() => {
    const nextSuggestions = debouncedSearchValue
      ? preparedResponses.slice(0, 5)
      : [];
    setSuggestions(nextSuggestions);
    setShowSuggestions(nextSuggestions.length > 0);
  }, [debouncedSearchValue, preparedResponses]);

  return {
    availableChannels,
    handleKeyDown,
    handleTemplateSelect,
    responseTemplateId,
    selectedIndex,
    setResponseTemplateId,
    setSearchValue,
    setShowSuggestions,
    setSuggestions,
    showSuggestions,
    suggestions,
  };
};
