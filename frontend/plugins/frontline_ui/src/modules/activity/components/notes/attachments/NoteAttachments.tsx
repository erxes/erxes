import type { INoteAttachment } from '@/activity/types';
import { IconX } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

interface NoteAttachmentsProps {
  attachments: INoteAttachment[];
  attachmentPreview: INoteAttachment | null;
  onRemove: (name: string) => void;
}

export const NoteAttachments = ({
  attachments,
  attachmentPreview,
  onRemove,
}: NoteAttachmentsProps) => {
  const { t } = useTranslation('frontline');

  return (
    <>
      {attachmentPreview && (
        <div className="mb-2">
          <p className="text-sm">{attachmentPreview.name}</p>
          {attachmentPreview.type?.startsWith('image/') &&
            attachmentPreview.data && (
              <img
                src={attachmentPreview.data}
                alt="preview"
                className="max-w-[400px] max-h-[300px] rounded-lg shadow-sm mt-1"
              />
            )}
        </div>
      )}

      {attachments.length > 0 && (
        <div className="mt-2 text-sm text-muted-foreground space-y-1">
          {attachments.map((file) => (
            <div
              key={file.name}
              className="flex items-center justify-between bg-muted px-3 py-1 rounded-md"
            >
              <span role="img" aria-label="file">
                📁 {file.name} ({Math.round(file.size / 1024)} KB)
              </span>
              <button
                type="button"
                aria-label={t('attachment-removed')}
                onClick={() => onRemove(file.name)}
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
