import { useCallback, useEffect, useMemo, useState } from 'react';
import { stripHtml, toast, type useBlockEditor } from 'erxes-ui';
import { useDebounce } from 'use-debounce';
import { useTranslation } from 'react-i18next';
import type { Block } from '@blocknote/core';

import { useGetChannels } from '@/channels/hooks/useGetChannels';
import { getPreviewText } from '@/inbox/types/inbox';
import { useGetResponses } from '@/responseTemplate/hooks/useGetResponses';
import type { IResponseTemplate } from '@/responseTemplate/types';

const MAX_SUGGESTIONS = 5;

type MessageEditor = ReturnType<typeof useBlockEditor>;

export type ResponseTemplateSuggestion = IResponseTemplate & {
  preview: string;
};

export const useResponseTemplateSuggestions = ({
  editor,
  enabled,
}: {
  editor: MessageEditor;
  enabled: boolean;
}) => {
  const { t } = useTranslation('frontline');
  const { channels: availableChannels } = useGetChannels();
  const [searchValue, setSearchValue] = useState('');
  const [debouncedSearchValue] = useDebounce(searchValue, 300);
  const [isDismissed, setIsDismissed] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [responseTemplateId, setResponseTemplateId] = useState<string | null>(
    null,
  );
  const { responses, isInitialLoad, isRefetching } = useGetResponses({
    skip: !debouncedSearchValue || !enabled,
    variables: {
      filter: { searchValue: debouncedSearchValue || undefined },
    },
  });

  const suggestions = useMemo<ResponseTemplateSuggestion[]>(
    () =>
      debouncedSearchValue && enabled
        ? (responses || []).slice(0, MAX_SUGGESTIONS).map((response) => ({
            ...response,
            preview: getPreviewText(response.content || ''),
          }))
        : [],
    [debouncedSearchValue, enabled, responses],
  );
  const showSuggestions =
    Boolean(debouncedSearchValue) &&
    enabled &&
    !isDismissed &&
    !isInitialLoad &&
    !isRefetching &&
    suggestions.length > 0;

  const resetSuggestions = useCallback(() => {
    setSearchValue('');
    setSelectedIndex(-1);
    setIsDismissed(false);
  }, []);

  const selectTemplate = useCallback(
    async (templateContent: string, templateId?: string) => {
      try {
        let blocks: Block[];

        try {
          const parsed: unknown = JSON.parse(templateContent);
          blocks = Array.isArray(parsed)
            ? (parsed as Block[])
            : [{ type: 'paragraph', content: templateContent, props: {} }];
        } catch {
          blocks = [
            {
              type: 'paragraph',
              content: stripHtml(templateContent).trim(),
              props: {},
            },
          ];
        }

        await editor.replaceBlocks(editor.document, blocks);
        await editor.focus();
        setResponseTemplateId(templateId || null);
        resetSuggestions();
      } catch {
        toast({
          title: t('failed-to-insert-template', 'Failed to insert template'),
          variant: 'destructive',
        });
      }
    },
    [editor, resetSuggestions, t],
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
        return;
      }

      if (event.key === 'Enter') {
        const suggestion = suggestions[selectedIndex];
        if (suggestion) {
          event.preventDefault();
          selectTemplate(suggestion.content, suggestion._id);
        }
        return;
      }

      if (event.key === 'Escape') {
        event.preventDefault();
        setIsDismissed(true);
      }
    },
    [selectedIndex, selectTemplate, showSuggestions, suggestions],
  );

  useEffect(() => {
    setSelectedIndex(-1);
    setIsDismissed(false);
  }, [debouncedSearchValue]);

  return {
    availableChannels,
    handleKeyDown,
    isLoading: isInitialLoad || isRefetching,
    resetSuggestions,
    responseTemplateId,
    selectedIndex,
    selectTemplate,
    setResponseTemplateId,
    setSearchValue,
    showSuggestions,
    suggestions,
  };
};
