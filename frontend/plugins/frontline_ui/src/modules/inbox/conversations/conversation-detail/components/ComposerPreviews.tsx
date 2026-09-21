import { IconFile, IconPhoto } from '@tabler/icons-react';
import { Spinner, type IAttachment } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

import { ComposerAttachment } from './ComposerAttachment';
import type { PendingAttachment } from '../hooks/useMessageAttachments';

const PendingImage = ({ src, alt }: { src: string; alt: string }) => (
  // skipcq: JS-W1015
  <img src={src} alt={alt} className="size-full object-cover" />
);

type ComposerPreviewsProps = {
  attachments: IAttachment[];
  pendingAttachments: PendingAttachment[];
  onRemove: (url: string) => void;
};

export const ComposerPreviews = ({
  attachments,
  pendingAttachments,
  onRemove,
}: ComposerPreviewsProps) => {
  const { t } = useTranslation('frontline');
  if (!attachments.length && !pendingAttachments.length) return null;

  return (
    <div className="flex max-h-36 flex-none flex-wrap gap-2 overflow-y-auto border-b border-border/50 p-2 sm:px-3">
      {pendingAttachments.map((file) => {
        const AttachmentIcon = file.type.startsWith('image/')
          ? IconPhoto
          : IconFile;

        return (
          <div
            key={file.id}
            className="flex min-w-48 items-center gap-2 rounded-xl border bg-muted/35 p-2"
          >
            <span className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-md bg-background text-muted-foreground">
              {file.previewUrl ? (
                <PendingImage src={file.previewUrl} alt={file.name} />
              ) : (
                <AttachmentIcon className="size-4" />
              )}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-xs font-medium">
                {file.name}
              </span>
              <span className="block text-[11px] text-muted-foreground">
                {t('uploading', 'Uploading...')}
              </span>
            </span>
            <Spinner size="sm" />
          </div>
        );
      })}
      {attachments.map((attachment) => (
        <ComposerAttachment
          key={attachment.url}
          attachment={attachment}
          onRemove={() => onRemove(attachment.url)}
        />
      ))}
    </div>
  );
};
