import { useQuery } from '@apollo/client';
import { JSONContent, useEmailHtml } from 'erxes-ui';
import { useMemo } from 'react';
import { useDebounce } from 'use-debounce';
import { NOTIFICATION_TEMPLATE_PREVIEW } from '../graphql/notificationTemplateQueries';
import { composeTemplateDoc } from '../utils/composeTemplateDoc';

type TPreview = { subject: string; html: string; unresolved: string[] };

/**
 * The email as the server will send it, filled with the template's sample
 * values. Debounced, because it follows every keystroke.
 */
export const useNotificationTemplatePreview = ({
  templateKey,
  contentJson,
  subject,
  preheader,
}: {
  templateKey: string;
  contentJson?: JSONContent;
  subject?: string;
  preheader?: string;
}) => {
  // memoized: the editor's html is rendered again whenever the document object changes
  const doc = useMemo(() => composeTemplateDoc(contentJson), [contentJson]);
  const { html: content, error: renderError } = useEmailHtml(doc, preheader);

  const [variables] = useDebounce(
    { key: templateKey, input: { subject, preheader, content, contentJson } },
    500,
  );

  const { data, loading, error } = useQuery<{
    notificationTemplatePreview: TPreview;
  }>(NOTIFICATION_TEMPLATE_PREVIEW, {
    variables,
    skip: !variables.input.content || !variables.input.contentJson,
    fetchPolicy: 'network-only',
  });

  return {
    preview: data?.notificationTemplatePreview,
    loading,
    error: renderError || error,
  };
};
