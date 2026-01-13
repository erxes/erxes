import { IconX } from '@tabler/icons-react';
import {
  Button,
  Dropzone,
  DropzoneContent,
  DropzoneEmptyState,
  IAttachment,
  InfoCard,
  readImage,
  useErxesUpload,
  useRemoveFile,
} from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

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
  const { removeFile, isLoading } = useRemoveFile();
  const { t } = useTranslation('product', {
    keyPrefix: 'detail',
  });

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
    <InfoCard title={t('attachment')}>
      <InfoCard.Content>
        <div className="flex flex-wrap gap-4">
          {files.map((attachment) => (
            <div
              key={attachment.url}
              className="aspect-square w-32 rounded-md overflow-hidden shadow-xs relative"
            >
              <img
                src={readImage(attachment.url)}
                alt={attachment.name}
                className="w-full h-full object-contain"
              />
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-0 right-0"
                disabled={isLoading}
                onClick={() =>
                  removeFile(attachment.name, (status) => {
                    if (status === 'ok') {
                      setFiles(
                        files.filter((file) => file.name !== attachment.name),
                      );
                    }
                  })
                }
              >
                <IconX size={12} />
              </Button>
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
