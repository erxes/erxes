import FileAttachments from './FileAttachments';
import { MediaAttachments } from './MediaAttachments';
import { useAttachmentContext } from './AttachmentContext';
import { useTranslation } from 'react-i18next';

const fileTypes = [
  'text/plain',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // docx
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // xlsx
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation', // pptx
];

// const audioTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg'];
// const videoTypes = ['video/mp4', 'video/webm', 'video/ogg'];

export const Attachments = () => {
  const { attachments } = useAttachmentContext();
  const { t } = useTranslation('sales');

  if (attachments.length === 0) {
    return null;
  }

  const mediaAttachments = attachments.filter((attachment) =>
    attachment.type.startsWith('image/'),
  );
  const fileAttachments = attachments.filter((attachment) =>
    fileTypes.includes(attachment.type),
  );

  if (mediaAttachments.length === 0 && fileAttachments.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col">
      {mediaAttachments.length > 0 && (
        <div className="flex flex-col gap-4 py-4">
          <span className="px-8 text-sm uppercase text-muted-foreground">
            {t('media-attachments')}
          </span>
          <MediaAttachments attachments={mediaAttachments} />
        </div>
      )}
      {fileAttachments.length > 0 && (
        <div className="flex flex-col gap-2 px-8 py-4">
          <span className="text-sm uppercase text-muted-foreground">
            {t('file-attachments')}
          </span>
          <FileAttachments attachments={fileAttachments} />
        </div>
      )}
    </div>
  );
};
