import { useCallback, useEffect, useMemo, useState } from 'react';
import { stripHtml, toast } from 'erxes-ui';
import { useDebounce } from 'use-debounce';
import { useTranslation } from 'react-i18next';

import { useGetChannels } from '@/channels/hooks/useGetChannels';
import { getPreviewText } from '@/inbox/types/inbox';
import { useGetResponses } from '@/responseTemplate/hooks/useGetResponses';
import type {
  ResponseTemplateSuggestion,
  ResponseTemplateSuggestionsOptions,
} from '@/inbox/conversations/conversation-detail/types/responseTemplateSuggestions';
import type { ComposerBlockEditor } from '@/inbox/conversations/conversation-detail/types/composer';
import { MAX_TEMPLATE_SUGGESTIONS } from '@/inbox/constants/responseTemplateSuggestions';
import { toResponseTemplateText } from '@/responseTemplate/utils/toResponseTemplateText';

export const useResponseTemplateSuggestions = ({
  editor,
  enabled,
}: ResponseTemplateSuggestionsOptions) => {
  const { t } = useTranslation('frontline');
  const { channels: availableChannels } = useGetChannels({ skip: !enabled });
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
        ? (responses || [])
            .slice(0, MAX_TEMPLATE_SUGGESTIONS)
            .map((response) => ({
              ...toResponseTemplateText(response),
              preview: getPreviewText(response.content || ''),
            }))
        : [],
    [debouncedSearchValue, enabled, responses],
  );
  const showSuggestionDropdown =
    Boolean(debouncedSearchValue) && enabled && !isDismissed;
  const showSuggestions =
    showSuggestionDropdown &&
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
        let blocks: Parameters<ComposerBlockEditor['replaceBlocks']>[1];

        try {
          const parsed: unknown = JSON.parse(templateContent);
          blocks = Array.isArray(parsed)
            ? (parsed as typeof blocks)
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
    (event: Pick<KeyboardEvent, 'key' | 'preventDefault' | 'isComposing'>) => {
      if (!showSuggestions || event.isComposing) return;

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
    showSuggestionDropdown,
    showSuggestions,
    suggestions,
  };
};
