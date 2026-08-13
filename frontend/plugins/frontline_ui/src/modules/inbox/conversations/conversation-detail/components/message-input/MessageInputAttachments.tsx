import { IconX } from '@tabler/icons-react';
import { type IAttachment } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { type AttachmentPreview } from '@/inbox/conversations/conversation-detail/hooks/useMessageAttachments';

interface MessageInputAttachmentsProps {
  attachmentPreview: AttachmentPreview | null;
  attachments: IAttachment[];
  onDelete: (name: string) => void;
}

export const MessageInputAttachments = ({
  attachmentPreview,
  attachments,
  onDelete,
}: MessageInputAttachmentsProps) => {
  const { t } = useTranslation('frontline');

  return (
    <>
      {attachmentPreview && (
        <div className="mx-4 mb-2 rounded-lg border bg-muted/30 p-3">
          <p className="text-sm">{attachmentPreview.name}</p>
          {attachmentPreview.type.startsWith('image/') && (
            <img
              src={attachmentPreview.data}
              alt="preview"
              className="max-h-[300px] max-w-[400px] rounded-lg shadow-sm mt-1"
            />
          )}
        </div>
      )}

      {attachments.length > 0 && (
        <div className="mx-4 mt-2 space-y-1 text-sm text-muted-foreground">
          {attachments.map((file) => (
            <div
              key={file.url}
              className="flex items-center justify-between bg-muted px-3 py-1 rounded-md"
            >
              <span role="img" aria-label="file">
                📁 {file.name} ({Math.round(file.size / 1024)} KB)
              </span>
              <button
                type="button"
                aria-label={t('attachment-removed')}
                onClick={() => onDelete(file.name)}
                className="text-destructive hover:text-red-700"
              >
                <IconX size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </>
  );
};
