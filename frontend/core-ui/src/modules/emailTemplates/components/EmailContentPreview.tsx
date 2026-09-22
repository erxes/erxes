import { SAMPLE_EMAIL_PAYLOADS } from '@/emailTemplates/constants';
import { useEmailContentPreview } from '@/emailTemplates/hooks/useEmailContentPreview';
import { TEmailContentFormat } from '@/emailTemplates/types';
import { EmailPreviewFrame, JSONContent, Spinner } from 'erxes-ui';

/** The rendered email, beside the one being written. */
export const EmailContentPreview = ({
  content,
  contentJson,
  contentFormat,
  previewText,
}: {
  content?: string;
  contentJson?: JSONContent;
  contentFormat?: TEmailContentFormat;
  previewText?: string;
}) => {
  const { html, loading, error } = useEmailContentPreview({
    content,
    contentJson,
    contentFormat,
    previewText,
    // A repeated block has nothing to walk while the email is being written,
    // so the preview walks a sample of the shape it expects.
    payloads: SAMPLE_EMAIL_PAYLOADS,
  });

  if (error) {
    return (
      <div className="flex h-full items-center justify-center p-6 text-center text-sm text-destructive">
        {error.message}
      </div>
    );
  }

  if (!html) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
        {loading ? <Spinner /> : 'Nothing written yet'}
      </div>
    );
  }

  return <EmailPreviewFrame html={html} className="h-full" />;
};
