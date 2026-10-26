import { JSONContent } from 'erxes-ui';

const htmlBlock = (text: string): JSONContent => ({
  type: 'htmlCodeBlock',
  attrs: { language: 'html' },
  content: [{ type: 'text', text }],
});

/**
 * The email as sent: the body as written between the brand's header and
 * footer. Both are filled by the server on every send, so a brand change
 * reaches published templates without saving them again.
 */
export const composeTemplateDoc = (body?: JSONContent): JSONContent => ({
  type: 'doc',
  content: [
    htmlBlock('{{ brand.header }}'),
    ...(body?.content || []),
    htmlBlock('{{ brand.footer }}'),
  ],
});
