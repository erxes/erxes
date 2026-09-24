import { useEmailContentPreview } from '@/emailTemplates/hooks/useEmailContentPreview';
import { TEmailContentFormat } from '@/emailTemplates/types';
import {
  EmailPreviewDevice,
  EmailPreviewFrame,
  JSONContent,
  Spinner,
} from 'erxes-ui';
import { useState } from 'react';
import { SelectCustomer } from 'ui-modules';

/** The rendered email, beside the one being written. */
export const EmailContentPreview = ({
  content,
  contentJson,
  contentFormat,
  previewText,
  device,
}: {
  content?: string;
  contentJson?: JSONContent;
  contentFormat?: TEmailContentFormat;
  previewText?: string;
  device?: EmailPreviewDevice;
}) => {
  // Rehearsed on somebody real when one is picked. A field is only ever wrong
  // or merely thin against an actual record, never against nothing.
  const [replacerId, setReplacerId] = useState<string>();

  const { html, loading, error } = useEmailContentPreview({
    content,
    contentJson,
    contentFormat,
    previewText,
    replacerId,
  });

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex shrink-0 items-center gap-2 border-b px-3 py-2">
        <span className="shrink-0 text-xs text-muted-foreground">
          Preview as
        </span>
        <SelectCustomer
          mode="single"
          value={replacerId ? [replacerId] : []}
          onValueChange={(value) =>
            setReplacerId(
              (Array.isArray(value) ? value[0] : value) || undefined,
            )
          }
          className="h-7"
        />
      </div>

      <div className="min-h-0 flex-1">
        {error ? (
          <div className="flex h-full items-center justify-center p-6 text-center text-sm text-destructive">
            {error.message}
          </div>
        ) : !html ? (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            {loading ? <Spinner /> : 'Nothing written yet'}
          </div>
        ) : (
          <EmailPreviewFrame html={html} device={device} className="h-full" />
        )}
      </div>
    </div>
  );
};
