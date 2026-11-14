import { IEmailTemplate } from '@/emailTemplates/types';
import type { DefaultReactSuggestionItem } from '@blocknote/react';
import { IBlockEditor } from 'erxes-ui';

type TConfirm = (input: { message: string }) => Promise<void>;

const plainTextBlock = (text: string) => ({
  id: crypto.randomUUID(),
  type: 'paragraph',
  props: {
    textColor: 'default',
    backgroundColor: 'default',
    textAlignment: 'left',
  },
  content: [{ type: 'text', text, styles: {} }],
  children: [],
});

/** A template's saved blocks, or its text as one paragraph when not JSON. */
export const blocksOfTemplateContent = (content: string) => {
  try {
    return JSON.parse(content);
  } catch {
    return [plainTextBlock(content)];
  }
};

/** Each template as an "@" menu item that replaces the email once confirmed. */
export const emailTemplateMenuItems = (
  editor: IBlockEditor,
  emailTemplates: IEmailTemplate[],
  loadEmailTemplate: (id: string) => void,
  confirm: TConfirm,
): DefaultReactSuggestionItem[] =>
  emailTemplates.map((template) => ({
    title: template.name,
    onItemClick: () => {
      confirm({
        message: `Are you sure you want to set this template to the email content? This will replace the current content.`,
      }).then(() => {
        editor.suggestionMenus.clearQuery();
        editor.suggestionMenus.closeMenu();
        loadEmailTemplate(template._id);
      });
    },
  }));
