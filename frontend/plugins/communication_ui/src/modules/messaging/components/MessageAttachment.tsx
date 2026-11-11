import { useEffect, useState } from 'react';
import {
  IconDownload,
  IconEye,
  IconFile,
  IconPhoto,
} from '@tabler/icons-react';
import { Button, Spinner, toast } from 'erxes-ui';
import { REACT_APP_API_URL } from 'erxes-ui/utils';
import type { AdminAttachment } from '../types';
import { formatBytes } from '../utils';

const PREVIEWABLE = new Set(['image/png', 'image/jpeg', 'image/gif']);

// The admin route authorizes and audits each request. The custom header only
// travels on same-site or CORS-approved requests from the admin UI.
const fetchAttachment = async (downloadPath: string) => {
  const response = await fetch(REACT_APP_API_URL + downloadPath, {
    credentials: 'include',
    headers: { 'x-communication-messaging-admin': '1' },
  });
  if (!response.ok) {
    throw new Error(
      response.status === 403
        ? 'You do not have permission to open this attachment.'
        : 'This attachment is unavailable.',
    );
  }
  return response.blob();
};

export const MessageAttachment = ({
  attachment,
}: {
  attachment: AdminAttachment;
}) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const { downloadPath } = attachment;
  const isImage = PREVIEWABLE.has(attachment.mimeType);

  useEffect(
    () => () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    },
    [previewUrl],
  );

  const load = async (handle: (blob: Blob) => void) => {
    if (!downloadPath) return;
    setBusy(true);
    try {
      handle(await fetchAttachment(downloadPath));
    } catch (error) {
      toast({
        title: 'Could not open attachment',
        description: error instanceof Error ? error.message : undefined,
        variant: 'destructive',
      });
    } finally {
      setBusy(false);
    }
  };

  const preview = () =>
    load((blob) => setPreviewUrl(URL.createObjectURL(blob)));

  const download = () =>
    load((blob) => {
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = attachment.name;
      link.click();
      URL.revokeObjectURL(url);
    });

  const Icon = isImage ? IconPhoto : IconFile;

  return (
    <div className="mt-2 max-w-sm rounded-md border bg-background">
      <div className="flex items-center gap-2 px-3 py-2">
        <Icon className="size-4 shrink-0 text-muted-foreground" />
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-medium">{attachment.name}</div>
          <div className="text-xs text-muted-foreground">
            {attachment.mimeType} · {formatBytes(attachment.size)}
          </div>
        </div>
        {busy && <Spinner size="sm" />}
        {downloadPath && !busy && (
          <>
            {isImage && !previewUrl && (
              <Button
                variant="ghost"
                size="icon"
                onClick={preview}
                aria-label={`Preview ${attachment.name}`}
              >
                <IconEye />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={download}
              aria-label={`Download ${attachment.name}`}
            >
              <IconDownload />
            </Button>
          </>
        )}
      </div>
      {!downloadPath && (
        <div className="border-t px-3 py-1.5 text-xs text-muted-foreground">
          File not available for download
        </div>
      )}
      {previewUrl && (
        <img
          src={previewUrl}
          alt={attachment.name}
          className="max-h-72 w-full rounded-b-md border-t object-contain"
        />
      )}
    </div>
  );
};
