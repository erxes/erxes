import { Spinner, Upload, cn } from 'erxes-ui';
import { useEffect, useState } from 'react';

import { IconPaperclip } from '@tabler/icons-react';
import { removeTypename } from '@/deals/utils/common';
import { useAttachmentContext } from './AttachmentContext';
import { useDealsContext } from '@/deals/context/DealContext';
import { useTranslation } from 'react-i18next';

const AttachmentUploader = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({
    uploaded: 0,
    total: 0,
  });

  const { addAttachment, attachments, dealId } = useAttachmentContext();
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

  const { t } = useTranslation('sales');

  useEffect(() => {
    if (
      uploadProgress.total > 0 &&
      uploadProgress.uploaded === uploadProgress.total
    ) {
      const cleanAttachments = attachments.map(removeTypename);

      editDeals({
        variables: {
          _id: dealId,
          attachments: cleanAttachments,
        },
      });
      setIsLoading(false);
      setUploadProgress({ uploaded: 0, total: 0 });
    }
  }, [attachments, uploadProgress, editDeals, dealId]);

  return (
    <Upload.Root
      value={''}
      multiple={true}
      className="items-center"
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
        variant="secondary"
        type="button"
        disabled={isLoading}
        className={cn(
          'h-7 gap-1.5 rounded-md px-2.5 text-sm font-medium text-muted-foreground',
          'hover:text-foreground',
          isLoading && 'opacity-70',
        )}
      >
        {isLoading ? (
          <>
            <Spinner size="sm" />
            <span>
              {uploadProgress.uploaded}/{uploadProgress.total}
            </span>
          </>
        ) : (
          <IconPaperclip size={14} />
        )}
        {t('add-attachments')}
      </Upload.Button>
    </Upload.Root>
  );
};

export default AttachmentUploader;
