import {
  Dropzone,
  DropzoneContent,
  DropzoneEmptyState,
  IAttachment,
  InfoCard,
  readImage,
  useErxesUpload,
} from 'erxes-ui';
import { useState } from 'react';

export const ProductDetailAttachment = ({
  attachment,
  attachmentMore,
}: {
  attachment: IAttachment;
  attachmentMore: IAttachment[];
}) => {
  const [files, setFiles] = useState<any[]>(
    [attachment, ...attachmentMore].filter(Boolean),
  );

  const props = useErxesUpload({
    allowedMimeTypes: ['image/*'],
    maxFiles: 10,
    maxFileSize: 20 * 1024 * 1024,
    onFilesAdded: (addedFiles) => {
      setFiles([
        ...files.filter(
          (file) => !addedFiles.some((f) => f.name === file.name),
        ),
        ...addedFiles.map((file) => ({
          name: file.name,
          url: file.url,
          type: file.type,
          size: file.size,
        })),
      ]);
    },
  });
  return (
    <InfoCard title="Attachments">
      <InfoCard.Content>
        <div className="flex flex-wrap gap-4">
          {files.map((attachment) => (
            <div
              key={attachment.url}
              className="aspect-square w-32 rounded-md overflow-hidden shadow-xs"
            >
              <img
                src={readImage(attachment.url)}
                alt={attachment.name}
                className="w-full h-full object-contain"
              />
            </div>
          ))}
        </div>
        <Dropzone {...props}>
          <DropzoneEmptyState />
          <DropzoneContent />
        </Dropzone>
      </InfoCard.Content>
    </InfoCard>
  );
};
