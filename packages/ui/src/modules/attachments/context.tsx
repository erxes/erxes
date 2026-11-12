import React, { createContext, useContext, useState } from 'react';
import { toast } from 'erxes-ui/hooks/use-toast';
import { errorMessage } from 'erxes-ui/utils/file-storage';
import type { AttachmentContextType, IAttachment } from './types';

const AttachmentContext = createContext<AttachmentContextType | null>(null);

export const useAttachmentContext = (): AttachmentContextType => {
  const ctx = useContext(AttachmentContext);

  if (!ctx) {
    throw new Error('useAttachmentContext must be used within <Attachments.Root>');
  }

  return ctx;
};

const defaultConfirm = (attachment: IAttachment) =>
  window.confirm(`Are you sure you want to delete "${attachment.name}"?`);

const NO_ATTACHMENTS: IAttachment[] = [];

export type AttachmentRootProps = {
  children: React.ReactNode;
  initialAttachments?: IAttachment[];
  onSave?: (attachments: IAttachment[]) => Promise<void> | void;
  onRemove?: (
    attachment: IAttachment,
    remaining: IAttachment[],
  ) => Promise<boolean | void> | boolean | void;
  confirmRemove?: (attachment: IAttachment) => Promise<boolean> | boolean;
  isLoading?: boolean;
};

/** The attachments: start from `initialAttachments` and follow it whenever it changes. */
const useAttachments = (initialAttachments: IAttachment[]) => {
  const [attachments, setAttachments] = useState(initialAttachments);
  const [synced, setSynced] = useState(initialAttachments);

  if (initialAttachments !== synced) {
    setSynced(initialAttachments);
    setAttachments(initialAttachments);
  }

  return [attachments, setAttachments] as const;
};

export const AttachmentRoot = ({
  children,
  initialAttachments = NO_ATTACHMENTS,
  onSave,
  onRemove,
  confirmRemove = defaultConfirm,
  isLoading = false,
}: AttachmentRootProps) => {
  const [attachments, setAttachments] = useAttachments(initialAttachments);
  const [removingUrl, setRemovingUrl] = useState<string | null>(null);

  const removeAttachment = async (attachment: IAttachment) => {
    const remaining = attachments.filter((item) => item.url !== attachment.url);

    setRemovingUrl(attachment.url);

    try {
      if ((await onRemove?.(attachment, remaining)) === false) return;

      setAttachments(remaining);
      await onSave?.(remaining);
    } catch (error) {
      toast({
        title: 'Could not remove the attachment',
        description: errorMessage(error, 'Remove failed'),
        variant: 'destructive',
      });
    } finally {
      setRemovingUrl(null);
    }
  };

  const handleRemoveAttachment = async (event: React.MouseEvent, attachment: IAttachment) => {
    event.stopPropagation();

    if (await confirmRemove(attachment)) await removeAttachment(attachment);
  };

  const context = {
    attachments,
    addAttachment: (attachment: IAttachment) => setAttachments((prev) => [...prev, attachment]),
    handleRemoveAttachment,
    removingUrl,
    resetAttachments: () => setAttachments([]),
    isLoading,
  };

  return <AttachmentContext.Provider value={context}>{children}</AttachmentContext.Provider>;
};
