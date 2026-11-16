import { useEmailTemplates } from '@/emailTemplates/hooks/useEmailTemplates';
import { emailTemplateFormat } from '@/emailTemplates/types';
import type { Editor as TiptapEditor } from '@tiptap/core';
import { useCallback } from 'react';

/**
 * Templates that can replace the editor's content. Block templates cannot be
 * poured into this editor, so they are not offered rather than inserted as
 * something they are not.
 */
export const useBroadcastInsertTemplate = (editor: TiptapEditor) => {
  const { emailTemplates } = useEmailTemplates();
  const templates = emailTemplates.filter(
    (template) => emailTemplateFormat(template) === 'maily',
  );

  const insertTemplate = useCallback(
    (templateId: string) => {
      const template = templates.find(({ _id }) => _id === templateId);

      if (template?.contentJson) {
        editor.commands.setContent(template.contentJson, true);
      }
    },
    [templates, editor],
  );

  return { templates, insertTemplate };
};
