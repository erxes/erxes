import {
  blocksOfTemplateContent,
  emailTemplateMenuItems,
} from '@/automations/components/builder/nodes/actions/sendEmail/utils/emailTemplateBlocks';
import { useEmailTemplateDetailLazy } from '@/emailTemplates/hooks/useEmailTemplateDetail';
import { useEmailTemplates } from '@/emailTemplates/hooks/useEmailTemplates';
import { emailTemplateFormat } from '@/emailTemplates/types';
import { filterSuggestionItems } from '@blocknote/core';
import { IBlockEditor, useConfirm } from 'erxes-ui';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDebounce } from 'use-debounce';

const SEARCH_DEBOUNCE_MS = 300;

/**
 * Templates offered by typing "@" in the block email editor. Only block
 * templates can be poured into it; picking one replaces the content.
 */
export const useEmailTemplateInEditor = (editor: IBlockEditor) => {
  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebounce(search, SEARCH_DEBOUNCE_MS);
  const { confirm } = useConfirm();
  const { emailTemplates: allTemplates = [], loading } = useEmailTemplates({
    searchValue: debouncedSearch,
  });
  const { loadEmailTemplate, emailTemplate } = useEmailTemplateDetailLazy();

  const emailTemplates = useMemo(
    () =>
      allTemplates.filter(
        (template) => emailTemplateFormat(template) === 'blocks',
      ),
    [allTemplates],
  );

  useEffect(() => {
    if (emailTemplate?.content) {
      editor.replaceBlocks(
        editor.document,
        blocksOfTemplateContent(emailTemplate.content),
      );
    }
  }, [emailTemplate?.content, editor]);

  const getItems = useCallback(
    async (query: string) => {
      setSearch(query);

      return filterSuggestionItems(
        emailTemplateMenuItems(
          editor,
          emailTemplates,
          loadEmailTemplate,
          confirm,
        ),
        query,
      );
    },
    [editor, emailTemplates, loadEmailTemplate, confirm],
  );

  return { loading, emailTemplates, getItems };
};
