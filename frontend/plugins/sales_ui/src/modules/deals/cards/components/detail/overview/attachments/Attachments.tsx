import FileAttachments from './FileAttachments';
import MediaAttachments from './MediaAttachments';
import { useAttachmentContext } from './AttachmentContext';

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

const Attachments = () => {
  const { attachments } = useAttachmentContext();

  if (attachments.length === 0) {
    return null;
  }

  const mediaAttachments = attachments.filter((attachment) =>
    attachment.type.startsWith('image/'),
  );
  const fileAttachments = attachments.filter((attachment) =>
    fileTypes.includes(attachment.type),
  );
  // const audioAttachments = attachments.filter((attachment) =>
  //   audioTypes.includes(attachment.type),
  // );
  // const videoAttachments = attachments.filter((attachment) =>
  //   videoTypes.includes(attachment.type),
  // );

  return (
    <div className="flex flex-col">
      {fileAttachments.length > 0 && (
        <FileAttachments attachments={fileAttachments} />
      )}
      {mediaAttachments.length > 0 && (
        <MediaAttachments attachments={mediaAttachments} />
      )}
    </div>
  );
};

export default Attachments;
