import { EMAIL_CONTENT_PREVIEW } from '@/emailTemplates/graphql/queries';
import { useLazyQuery } from '@apollo/client';
import { JSONContent, renderEmailHtml } from 'erxes-ui';

type TPreviewEmail = { contentJson?: JSONContent; previewText?: string };

/** The email being written, rendered the way the server will send it. */
export const useBroadcastEmailPreview = () => {
  const [fetchPreview, { data, loading, error }] = useLazyQuery<{
    emailContentPreview?: string;
  }>(EMAIL_CONTENT_PREVIEW);

  const render = async (email?: TPreviewEmail) => {
    const result = await fetchPreview({
      variables: {
        content: await renderEmailHtml(email?.contentJson, {
          previewText: email?.previewText,
        }),
        contentFormat: 'maily',
      },
    });

    return {
      html: result.data?.emailContentPreview || '',
      error: result.error,
    };
  };

  return {
    render,
    html: data?.emailContentPreview || '',
    loading,
    error,
  };
};
