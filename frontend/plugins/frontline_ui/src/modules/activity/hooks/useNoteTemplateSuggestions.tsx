import { parseTemplateToBlocks } from '@/activity/utils/noteBlocks';
import type { INoteTemplateSuggestion } from '@/activity/types';
import { getPreviewText } from '@/inbox/types/inbox';
import { useGetResponses } from '@/responseTemplate/hooks/useGetResponses';
import { toast, useBlockEditor } from 'erxes-ui';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDebounce } from 'use-debounce';

const MAX_SUGGESTIONS = 5;

type TNoteEditor = ReturnType<typeof useBlockEditor>;

export const useNoteTemplateSuggestions = ({
  editor,
  enabled,
}: {
  editor: TNoteEditor;
  enabled: boolean;
}) => {
  const { t } = useTranslation('frontline');
  const [searchValue, setSearchValue] = useState('');
  const [debouncedSearchValue] = useDebounce(searchValue, 300);
  const [isDropdownDismissed, setIsDropdownDismissed] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const { responses } = useGetResponses({
    skip: !debouncedSearchValue || !enabled,
    variables: {
      filter: { searchValue: debouncedSearchValue || undefined },
    },
  });

  const suggestions = useMemo<INoteTemplateSuggestion[]>(
    () =>
      debouncedSearchValue && enabled
        ? (responses || [])
            .slice(0, MAX_SUGGESTIONS)
            .map((response: INoteTemplateSuggestion) => ({
              ...response,
              preview: getPreviewText(response.content || ''),
            }))
        : [],
    [responses, debouncedSearchValue, enabled],
  );

  const showSuggestions = suggestions.length > 0 && !isDropdownDismissed;

  const resetSuggestions = useCallback(() => {
    setSearchValue('');
    setSelectedIndex(-1);
    setIsDropdownDismissed(false);
  }, []);

  const selectTemplate = useCallback(
    (templateContent: string) => {
      if (!editor) return;

      try {
        editor.replaceBlocks(
          editor.document,
          parseTemplateToBlocks(templateContent),
        );
        editor.focus();
        resetSuggestions();
      } catch {
        toast({
          title: t('failed-to-insert-template'),
          variant: 'destructive',
        });
      }
    },
    [editor, t, resetSuggestions],
  );

  const handleEditorChange = useCallback(async () => {
    if (!editor) return;

    const html = await editor.blocksToHTMLLossy(editor.document);
    const plain = html?.replace(/<[^<>]*>/g, '')?.trim() || '';

    setSearchValue(plain);
    if (!plain) setIsDropdownDismissed(false);
  }, [editor]);

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
          if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
            e.preventDefault();
            selectTemplate(suggestions[selectedIndex].content);
          }
          break;
        case 'Escape':
          e.preventDefault();
          setIsDropdownDismissed(true);
          break;
      }
    },
    [showSuggestions, selectedIndex, suggestions, selectTemplate],
  );

  return {
    suggestions,
    showSuggestions,
    selectedIndex,
    selectTemplate,
    resetSuggestions,
    handleEditorChange,
    handleKeyDown,
  };
};
