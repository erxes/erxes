import { Attachments, useConfirm } from 'erxes-ui';
import { useEffect, useRef, useState } from 'react';

import { IconPaperclip } from '@tabler/icons-react';
import { removeTypename } from '@/utils';
import { useUpdateTicket } from '@/ticket/hooks/useUpdateTicket';
import { IAttachment } from '@/ticket/types/attachments';

type Props = {
  id: string;
  attachments: IAttachment[];
};

const AttachmentUploader = ({ id, attachments }: Props) => {
  const { confirm } = useConfirm();
  const [uploadProgress, setUploadProgress] = useState({
    uploaded: 0,
    total: 0,
  });
  const { updateTicket, loading } = useUpdateTicket();


  const attachmentsRef = useRef(attachments);
  useEffect(() => {
    attachmentsRef.current = attachments;
  }, [attachments]);

  const handleSave = async (nextAttachments: IAttachment[]): Promise<void> => {
    await updateTicket({
      variables: { _id: id, attachments: nextAttachments },
    });
  };

  const handleConfirmRemove = (attachment: IAttachment): Promise<boolean> =>
    new Promise((resolve) => {
      confirm({
        message: `Are you sure you want to delete "${attachment.name}"?`,
      })
        .then(() => resolve(true))
        .catch(() => resolve(false));
    });

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

      setUploadProgress({ uploaded: 0, total: 0 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uploadProgress]);

  return (
    <Attachments.Root
      initialAttachments={attachments}
      onSave={handleSave}
      confirmRemove={handleConfirmRemove}
      isLoading={loading}
    >
      <Attachments.Uploader onSave={handleSave} />
      <Attachments.Files />
      <Attachments.Preview />
      <Attachments.Video />
    </Attachments.Root>
  );
};

export default AttachmentUploader;
