import { useApolloClient } from '@apollo/client';
import { renderEmailHtml } from 'erxes-ui';
import { EMAIL_TEMPLATE_CONTENT_QUERY } from '../graphql/queries';
import { emailTemplateFormat } from '../types';
import type { EmailTemplate } from '../types';

export const useRenderEmailTemplate = (): ((
  template: EmailTemplate,
) => Promise<string>) => {
  const client = useApolloClient();
  return async (template) => {
    const contentFormat = emailTemplateFormat(template);
    const content =
      contentFormat === 'maily'
        ? await renderEmailHtml(template.contentJson)
        : template.content;
    if (!content) throw new Error('This email template has no content');
    const result = await client.query<{ emailContentPreview: string }>({
      query: EMAIL_TEMPLATE_CONTENT_QUERY,
      variables: { content, contentFormat },
      fetchPolicy: 'network-only',
    });
    return result.data.emailContentPreview;
  };
};
