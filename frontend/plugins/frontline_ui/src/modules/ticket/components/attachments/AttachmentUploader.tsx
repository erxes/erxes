import { Spinner, Upload, cn } from 'erxes-ui';
import { useEffect, useRef, useState } from 'react';

import { IconPaperclip } from '@tabler/icons-react';
import { removeTypename } from '@/utils';
import { useAttachmentContext } from './AttachmentContext';
import { useUpdateTicket } from '@/ticket/hooks/useUpdateTicket';

const AttachmentUploader = ({ id }: { id?: string }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({
    uploaded: 0,
    total: 0,
  });

  const { addAttachment, attachments } = useAttachmentContext();
  const { updateTicket } = useUpdateTicket();

  // Keep a ref to attachments so the effect can always read the latest value
  // without needing `attachments` as a dependency (which would cause a loop).
  const attachmentsRef = useRef(attachments);
  useEffect(() => {
    attachmentsRef.current = attachments;
  }, [attachments]);

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
      const cleanAttachments = attachmentsRef.current.map(removeTypename);

      updateTicket({
        variables: {
          _id: id,
          attachments: cleanAttachments,
        },
      });

      // Reset progress immediately so that when Apollo refetches and
      // `attachments` syncs via the provider, this effect does NOT re-fire.
      setUploadProgress({ uploaded: 0, total: 0 });
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uploadProgress]);

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
