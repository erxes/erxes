import { AttachmentContextType, IAttachment } from '@/deals/types/attachments';
import React, { createContext, useContext, useEffect, useState } from 'react';

import { removeTypename } from '@/deals/utils/common';
import { useConfirm } from 'erxes-ui';
import { useDealsContext } from '@/deals/context/DealContext';

const AttachmentContext = createContext<AttachmentContextType | null>(null);

export const useAttachmentContext = () => {
  const context = useContext(AttachmentContext);
  if (!context) {
    throw new Error(
      'useAttachmentContext must be used within <AttachmentProvider>',
    );
  }
  return context;
};

export const AttachmentProvider = ({
  children,
  initialAttachments = [],
}: {
  children: React.ReactNode;
  initialAttachments?: IAttachment[];
}) => {
  const [attachments, setAttachments] =
    useState<IAttachment[]>(initialAttachments);
  const [removingUrl, setRemovingUrl] = useState<string | null>(null);

  useEffect(() => {
    setAttachments(initialAttachments);
  }, [initialAttachments]);

  const addAttachment = (attachment: IAttachment) => {
    setAttachments((prev) => [...prev, attachment]);
  };

  const resetAttachments = () => {
    setAttachments([]);
  };

  const { editDeals } = useDealsContext();

  const removeAttachment = async (attachment: IAttachment) => {
    setRemovingUrl(attachment.url);

    const newAttachments = attachments
      .filter((att) => att.url !== attachment.url)
      .map((att) => removeTypename(att));

    try {
      await editDeals({
        variables: { attachments: newAttachments },
      });

      setAttachments((prev) =>
        prev.filter((att) => att.url !== attachment.url),
      );
    } catch (error) {
      // handle error if needed
      console.error('Failed to remove attachment:', error);
    } finally {
      setRemovingUrl(null);
    }
  };

  const { confirm } = useConfirm();

  const handleRemoveImage = (e: React.MouseEvent, attachment: IAttachment) => {
    e.stopPropagation();

    confirm({
      message: `Are you sure you want to delete ${attachment.name}?`,
    }).then(() => {
      removeAttachment(attachment);
    });
  };

  return (
    <AttachmentContext.Provider
      value={{
        attachments,
        addAttachment,
        handleRemoveImage,
        removingUrl,
        resetAttachments,
      }}
    >
      {children}
    </AttachmentContext.Provider>
  );
};
