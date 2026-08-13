import { toast } from 'erxes-ui';
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type KeyboardEvent,
} from 'react';
import { useDebounce } from 'use-debounce';
import { useTranslation } from 'react-i18next';
import { useGetChannels } from '@/channels/hooks/useGetChannels';
import { useGetResponses } from '@/responseTemplate/hooks/useGetResponses';
import { type IResponseTemplate } from '@/responseTemplate/types';
import { getPreviewText } from '@/inbox/types/inbox';
import {
  type MessageEditor,
  stripHtml,
} from '@/inbox/conversations/utils/messageInputUtils';

export type TemplateSuggestion = IResponseTemplate & { preview: string };

export const useMessageInputTemplates = (editor: MessageEditor) => {
  const { t } = useTranslation('frontline');
  const { channels: availableChannels } = useGetChannels();
  const [searchValue, setSearchValue] = useState('');
  const [debouncedSearchValue] = useDebounce(searchValue, 300);
  const [suggestions, setSuggestions] = useState<TemplateSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [responseTemplateId, setResponseTemplateId] = useState<string | null>(
    null,
  );

  const { responses } = useGetResponses({
    skip: !debouncedSearchValue,
    variables: {
      filter: {
        searchValue: debouncedSearchValue || undefined,
      },
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

  const handleTemplateSelect = useCallback(
    (templateContent: string, templateId?: string) => {
      if (!editor) {
        toast({ title: t('editor-not-ready'), variant: 'destructive' });
        return;
      }

      try {
        let blocksToInsert;
        try {
          const parsed = JSON.parse(templateContent);
          blocksToInsert = Array.isArray(parsed)
            ? parsed
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

        const existingBlocks = editor.document;
        if (existingBlocks.length) {
          editor.removeBlocks(existingBlocks.map((block) => block.id));
        }

        editor.insertBlocks(blocksToInsert, editor.document[0]?.id, 'before');
        editor.focus();
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

  const handleSuggestionKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!showSuggestions) return;

      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault();
          setSelectedIndex((current) =>
            current < suggestions.length - 1 ? current + 1 : current,
          );
          break;
        case 'ArrowUp':
          event.preventDefault();
          setSelectedIndex((current) => (current > 0 ? current - 1 : 0));
          break;
        case 'Enter':
          event.preventDefault();
          if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
            const suggestion = suggestions[selectedIndex];
            handleTemplateSelect(suggestion.content, suggestion._id);
          }
          break;
        case 'Escape':
          event.preventDefault();
          setShowSuggestions(false);
          break;
      }
    },
    [handleTemplateSelect, selectedIndex, showSuggestions, suggestions],
  );

  const clearSuggestions = useCallback(() => {
    setSearchValue('');
    setSuggestions([]);
    setShowSuggestions(false);
  }, []);

  const resetTemplate = useCallback(() => {
    clearSuggestions();
    setResponseTemplateId(null);
  }, [clearSuggestions]);

  useEffect(() => {
    setSelectedIndex(-1);
  }, [suggestions]);

  useEffect(() => {
    if (!debouncedSearchValue) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const nextSuggestions = preparedResponses.slice(0, 5);
    setSuggestions(nextSuggestions);
    setShowSuggestions(nextSuggestions.length > 0);
  }, [debouncedSearchValue, preparedResponses]);

  return {
    availableChannels,
    clearSuggestions,
    handleSuggestionKeyDown,
    handleTemplateSelect,
    resetTemplate,
    responseTemplateId,
    selectedIndex,
    setSearchValue,
    showSuggestions,
    suggestions,
  };
};
