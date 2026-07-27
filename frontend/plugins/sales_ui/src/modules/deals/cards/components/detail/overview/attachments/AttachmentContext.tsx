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
  dealId,
  initialAttachments = [],
}: {
  children: React.ReactNode;
  dealId: string;
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
      if (!dealId) {
        throw new Error('A deal ID is required to remove an attachment');
      }

      // useDealsEdit only defaults _id from the board-card atom, which is
      // empty when the sheet is opened straight from a salesItemId URL.
      await editDeals({
        variables: { _id: dealId, attachments: newAttachments },
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
        dealId,
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
