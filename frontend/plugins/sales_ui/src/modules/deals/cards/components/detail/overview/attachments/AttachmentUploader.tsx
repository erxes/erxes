import { Spinner, Upload, cn } from 'erxes-ui';
import { useEffect, useState } from 'react';

import { IconPaperclip } from '@tabler/icons-react';
import { removeTypename } from '@/deals/utils/common';
import { useAttachmentContext } from './AttachmentContext';
import { useDealsContext } from '@/deals/context/DealContext';

const AttachmentUploader = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({
    uploaded: 0,
    total: 0,
  });

  const { addAttachment, attachments } = useAttachmentContext();
  const { editDeals } = useDealsContext();

  const handleUploadStart = (fileCount: number) => {
    setIsLoading(true);
    setUploadProgress({ uploaded: 0, total: fileCount });
  };

  const handleUploadProgress = () => {
    setUploadProgress((prev) => ({
      ...prev,
      uploaded: prev.uploaded + 1,
    }));
  };

  const handleAllUploadsComplete = () => {
    setIsLoading(false);
  };

  useEffect(() => {
    if (
      uploadProgress.total > 0 &&
      uploadProgress.uploaded === uploadProgress.total
    ) {
      const cleanAttachments = attachments.map(removeTypename);

      editDeals({
        variables: {
          attachments: cleanAttachments,
        },
      });
      setIsLoading(false);
    }
  }, [attachments, uploadProgress, editDeals]);

  return (
    <Upload.Root
      value={''}
      multiple={true}
      className={cn('items-center', {
        'opacity-50': isLoading,
      })}
      onChange={(fileInfo) => {
        if ('url' in fileInfo) {
          addAttachment(fileInfo as any);
        }
      }}
    >
      <Upload.Preview
        className="hidden"
        onUploadStart={(count) => handleUploadStart(count || 0)}
        onUploadProgress={handleUploadProgress}
        onAllUploadsComplete={handleAllUploadsComplete}
      />
      <Upload.Button
        size="sm"
        variant="ghost"
        type="button"
        className={cn('flex items-center gap-1 cursor-pointer text-sm', {
          'opacity-50': isLoading,
        })}
      >
        {isLoading ? (
          <>
            <Spinner />
            <span>
              {uploadProgress.uploaded}/{uploadProgress.total}
            </span>
          </>
        ) : (
          <IconPaperclip size={16} />
        )}
        Add attachments
      </Upload.Button>
    </Upload.Root>
  );
};

export default AttachmentUploader;
