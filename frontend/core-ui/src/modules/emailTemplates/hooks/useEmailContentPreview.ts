import { useQuery } from '@apollo/client';
import { JSONContent } from 'erxes-ui';
import { useDebounce } from 'use-debounce';
import { EMAIL_CONTENT_PREVIEW } from '@/emailTemplates/graphql/queries';
import { TEmailContentFormat } from '@/emailTemplates/types';

type TPreviewInput = {
  content?: string;
  contentJson?: JSONContent;
  contentFormat?: TEmailContentFormat;
  previewText?: string;
  payloads?: Record<string, unknown>;
  skip?: boolean;
};

/**
 * The email as the server will build it. Debounced, because it is asked for
 * on every keystroke while someone writes.
 */
export const useEmailContentPreview = ({
  content,
  contentJson,
  contentFormat,
  previewText,
  payloads,
  skip,
}: TPreviewInput) => {
  const [variables] = useDebounce(
    { content, contentJson, contentFormat, previewText, payloads },
    500,
  );

  const { data, loading, error } = useQuery<{ emailContentPreview: string }>(
    EMAIL_CONTENT_PREVIEW,
    {
      variables,
      skip: skip || (!variables.content && !variables.contentJson),
      fetchPolicy: 'network-only',
    },
  );

  return { html: data?.emailContentPreview || '', loading, error };
};
