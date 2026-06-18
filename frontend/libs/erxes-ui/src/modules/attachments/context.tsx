import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import type { AttachmentContextType, IAttachment } from './types';

const AttachmentContext = createContext<AttachmentContextType | null>(null);

export const useAttachmentContext = (): AttachmentContextType => {
  const ctx = useContext(AttachmentContext);
  if (!ctx) {
    throw new Error(
      'useAttachmentContext must be used within <Attachments.Root>',
    );
  }
  return ctx;
};

function stripTypename<T extends object>(obj: T): T {
  const { __typename, ...rest } = obj as T & { __typename?: unknown };
  return rest as T;
}

const defaultConfirm = (attachment: IAttachment): Promise<boolean> =>
  Promise.resolve(
    window.confirm(`Are you sure you want to delete "${attachment.name}"?`),
  );

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

export const AttachmentRoot = ({
  children,
  initialAttachments = [],
  onSave,
  onRemove,
  confirmRemove = defaultConfirm,
  isLoading: externalLoading = false,
}: AttachmentRootProps) => {
  const [attachments, setAttachments] =
    useState<IAttachment[]>(initialAttachments);
  const [removingUrl, setRemovingUrl] = useState<string | null>(null);

  useEffect(() => {
    setAttachments(initialAttachments);
  }, [initialAttachments]);

  const addAttachment = useCallback((attachment: IAttachment) => {
    setAttachments((prev) => [...prev, attachment]);
  }, []);

  const resetAttachments = useCallback(() => {
    setAttachments([]);
  }, []);

  const removeAttachment = useCallback(
    async (attachment: IAttachment) => {
      setRemovingUrl(attachment.url);

      const remaining = attachments
        .filter((a) => a.url !== attachment.url)
        .map(stripTypename);

      try {
        if (onRemove) {
          const result = await onRemove(attachment, remaining);
          if (result === false) return;
        }
        setAttachments(remaining);
        await onSave?.(remaining);
      } catch (err) {
        console.error('[Attachments.Root] Failed to remove attachment:', err);
      } finally {
        setRemovingUrl(null);
      }
    },
    [attachments, onRemove, onSave],
  );

  const handleRemoveAttachment = useCallback(
    (e: React.MouseEvent, attachment: IAttachment) => {
      e.stopPropagation();
      Promise.resolve(confirmRemove(attachment)).then((confirmed) => {
        if (confirmed) removeAttachment(attachment);
      });
    },
    [confirmRemove, removeAttachment],
  );

  return (
    <AttachmentContext.Provider
      value={{
        attachments,
        addAttachment,
        handleRemoveAttachment,
        removingUrl,
        resetAttachments,
        isLoading: externalLoading,
      }}
    >
      {children}
    </AttachmentContext.Provider>
  );
};
