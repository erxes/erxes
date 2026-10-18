import FileAttachments from './FileAttachments';
import MediaAttachments from './MediaAttachments';
import VideoAttachments from './VideoAttachments';
import { AudioAttachments } from './AudioAttachments';
import { useAttachmentContext } from './AttachmentContext';

const Attachments = () => {
  const { attachments } = useAttachmentContext();

  // Guard against null/undefined items that GraphQL may include in the array
  const safeAttachments = attachments.filter(
    (attachment) => attachment?.type !== null,
  );

  if (safeAttachments.length === 0) {
    return null;
  }

  // A type is a MIME type when uploaded here and a bare word ("image",
  // "audio", "file") when it came from a conversation; both group by prefix.
  const kindOf = (type?: string) =>
    ['image', 'video', 'audio'].find((kind) => type?.startsWith(kind)) ||
    'file';
  const mediaAttachments = safeAttachments.filter(
    (attachment) => kindOf(attachment.type) === 'image',
  );
  const videoAttachments = safeAttachments.filter(
    (attachment) => kindOf(attachment.type) === 'video',
  );
  const audioAttachments = safeAttachments.filter(
    (attachment) => kindOf(attachment.type) === 'audio',
  );
  const fileAttachments = safeAttachments.filter(
    (attachment) => kindOf(attachment.type) === 'file',
  );

  return (
    <div className="border-b">
      <div className="flex flex-col">
        {fileAttachments.length > 0 && (
          <FileAttachments attachments={fileAttachments} />
        )}
        {mediaAttachments.length > 0 && (
          <MediaAttachments attachments={mediaAttachments} />
        )}
        {videoAttachments.length > 0 && (
          <VideoAttachments attachments={videoAttachments} />
        )}
        {audioAttachments.length > 0 && (
          <AudioAttachments attachments={audioAttachments} />
        )}
      </div>
    </div>
  );
};

export default Attachments;
