import { useQuery } from '@apollo/client';
import { JSONContent, useEmailHtml } from 'erxes-ui';
import { useDebounce } from 'use-debounce';
import { EMAIL_CONTENT_PREVIEW } from '@/emailTemplates/graphql/queries';
import { TEmailContentFormat } from '@/emailTemplates/types';

type TPreviewInput = {
  content?: string;
  contentJson?: JSONContent;
  contentFormat?: TEmailContentFormat;
  previewText?: string;
  /** Whose values fill the fields, when somebody real is picked. */
  replacerId?: string;
  skip?: boolean;
};

/**
 * The email as the server will build it. The email editor's html is rendered
 * here and only its fields are filled by the server. Debounced, because it is
 * asked for on every keystroke while someone writes.
 */
export const useEmailContentPreview = ({
  content,
  contentJson,
  contentFormat,
  previewText,
  replacerId,
  skip,
}: TPreviewInput) => {
  const isMaily = contentFormat === 'maily' || (!contentFormat && !!contentJson);
  const { html: mailyHtml, error: renderError } = useEmailHtml(
    isMaily ? contentJson : undefined,
    previewText,
  );

  const [variables] = useDebounce(
    { content: isMaily ? mailyHtml : content, contentFormat, replacerId },
    500,
  );

  const { data, loading, error } = useQuery<{ emailContentPreview: string }>(
    EMAIL_CONTENT_PREVIEW,
    {
      variables,
      skip: skip || !variables.content,
      fetchPolicy: 'network-only',
    },
  );

  return {
    html: data?.emailContentPreview || '',
    loading,
    error: renderError || error,
  };
};
