import {
  Dropzone,
  DropzoneContent,
  DropzoneEmptyState,
  IAttachment,
  InfoCard,
  useErxesUpload,
} from 'erxes-ui';

export const ProductDetailAttachment = ({
  attachment,
  attachmentMore,
}: {
  attachment: IAttachment;
  attachmentMore: IAttachment[];
}) => {
  const attachments = [attachment, ...attachmentMore].filter(Boolean);
  const props = useErxesUpload({
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    maxFileSize: 10 * 1024 * 1024, // 10MB
    maxFiles: 10,
  });
  return (
    <InfoCard title="Attachments">
      <InfoCard.Content>
        {attachments.map((attachment) => (
          <div key={attachment.url}>
            <img src={attachment.url} alt={attachment.name} />
          </div>
        ))}
        <Dropzone {...props}>
          <DropzoneEmptyState />
          <DropzoneContent />
        </Dropzone>
      </InfoCard.Content>
    </InfoCard>
  );
};
