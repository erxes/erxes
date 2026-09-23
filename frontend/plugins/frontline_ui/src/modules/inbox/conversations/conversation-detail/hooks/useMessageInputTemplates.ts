import type { MessageInputTemplatesResult } from '@/inbox/conversations/conversation-detail/types/messageInput';
import { parseBlocks, stripHtml, toast } from 'erxes-ui';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDebounce } from 'use-debounce';

import { useTranslation } from 'react-i18next';

import { getPreviewText } from '@/inbox/types/inbox';

import { useGetChannels } from '@/channels/hooks/useGetChannels';
import { useGetResponses } from '@/responseTemplate/hooks/useGetResponses';

import type { IBlockEditor } from 'erxes-ui';
import type { IResponseTemplate } from '@/responseTemplate/types';

export const useMessageInputTemplates = (
  editor: IBlockEditor,
): MessageInputTemplatesResult => {
  const { t } = useTranslation('frontline');
  const { channels: availableChannels } = useGetChannels();
  const [searchValue, setSearchValue] = useState('');
  const [debouncedSearchValue] = useDebounce(searchValue, 300);

  const { responses } = useGetResponses({
    skip: !debouncedSearchValue,
    variables: {
      filter: {
        searchValue: debouncedSearchValue || undefined,
      },
    },
  });
  const [suggestions, setSuggestions] = useState<IResponseTemplate[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [responseTemplateId, setResponseTemplateId] = useState<string | null>(
    null,
  );

  const preparedResponses = useMemo(
    () =>
      (responses || []).map((r) => ({
        ...r,
        preview: getPreviewText(r.content || ''),
      })),
    [responses],
  );

  const handleTemplateSelect = useCallback(
    async (templateContent: string, templateId?: string) => {
      if (!editor) {
        return toast({
          title: t('editor-not-ready', 'Editor not ready'),
          variant: 'destructive',
        });
      }

      try {
        const blocksToInsert = parseBlocks(templateContent) || [
          {
            type: 'paragraph' as const,
            content: stripHtml(templateContent),
            props: {},
          },
        ];

        const existingBlocks = editor.document;
        if (existingBlocks?.length) {
          await editor.removeBlocks(existingBlocks.map((b) => b.id));
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
          title: t('failed-to-insert-template', 'Failed to insert template'),
          variant: 'destructive',
        });
      }
    },
    [editor, t],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!showSuggestions) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev < suggestions.length - 1 ? prev + 1 : prev,
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
          break;
        case 'Enter':
          e.preventDefault();
          if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
            handleTemplateSelect(
              suggestions[selectedIndex].content,
              suggestions[selectedIndex]._id,
            );
            setShowSuggestions(false);
          }
          break;
        case 'Escape':
          e.preventDefault();
          setShowSuggestions(false);
          break;
      }
    },
    [showSuggestions, selectedIndex, suggestions, handleTemplateSelect],
  );

  useEffect(() => {
    setSelectedIndex(-1);
  }, [suggestions]);

  useEffect(() => {
    if (!debouncedSearchValue) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    if (preparedResponses?.length > 0) {
      setSuggestions(preparedResponses.slice(0, 5));
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [preparedResponses, debouncedSearchValue]);

  return {
    availableChannels,
    suggestions,
    setSuggestions,
    showSuggestions,
    setShowSuggestions,
    selectedIndex,
    responseTemplateId,
    setResponseTemplateId,
    setSearchValue,
    handleTemplateSelect,
    handleKeyDown,
  };
};
