import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast, useBlockEditor } from 'erxes-ui';
import { useDebounce } from 'use-debounce';
import { useTranslation } from 'react-i18next';

import { useGetChannels } from '@/channels/hooks/useGetChannels';
import { useGetResponses } from '@/responseTemplate/hooks/useGetResponses';
import { getPreviewText } from '@/inbox/types/inbox';

type MessageEditor = ReturnType<typeof useBlockEditor>;

const stripHtml = (html: string): string => {
  const parsed = new DOMParser().parseFromString(html, 'text/html');
  return parsed.body.textContent || '';
};

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

  const handleTemplateSelect = useCallback(
    async (templateContent: string, templateId?: string) => {
      if (!editor) {
        return toast({ title: t('editor-not-ready'), variant: 'destructive' });
      }
      const parseTemplateToBlocks = (content: string) => {
        try {
          const parsed: unknown = JSON.parse(content);
          return Array.isArray(parsed)
            ? parsed
            : [{ type: 'paragraph', content, props: {} }];
        } catch {
          return [
            { type: 'paragraph', content: stripHtml(content).trim(), props: {} },
          ];
        }
      };
      try {
        const blocksToInsert = parseTemplateToBlocks(templateContent);
        if (editor.document.length) {
          await editor.removeBlocks(editor.document.map((block) => block.id));
        }
        await editor.insertBlocks(
          blocksToInsert,
          editor.topLevelBlocks[0]?.id,
          'before',
        );
        await editor.focus();
        setShowSuggestions(false);
        setResponseTemplateId(templateId || null);
      } catch {
        toast({
          title: t('failed-to-insert-template'),
          variant: 'destructive',
        });
      }
    },
    [editor, t],
  );

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
  }, [preparedResponses, debouncedSearchValue]);

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
