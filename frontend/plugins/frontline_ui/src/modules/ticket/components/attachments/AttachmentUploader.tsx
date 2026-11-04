import {
  Attachments,
  Dropzone,
  DropzoneContent,
  DropzoneEmptyState,
  cn,
  isDeeplyEqual,
  useConfirm,
  useErxesUpload,
  useToast,
  type FileWithPreview,
} from 'erxes-ui';
import { useCallback, useEffect, useRef } from 'react';
import { useAtom, useAtomValue, useStore } from 'jotai';
import { currentUserState } from 'ui-modules';
import { ticketAttachmentOperationsState } from '@/ticket/states/ticketAttachmentOperationsState';
import { useTranslation } from 'react-i18next';
import { toAttachmentInput } from '@/ticket/utils/ticketAttachments';
import { useUpdateTicket } from '@/ticket/hooks/useUpdateTicket';
import type { IAttachment } from '@/ticket/types/attachments';

type Props = {
  id: string;
  attachments: IAttachment[];
};

/** Uploads and removes ticket attachments using the shared operation lock. */
export const AttachmentUploader = ({ id, attachments }: Props) => {
  const { confirm } = useConfirm();
  const { toast } = useToast();
  const { t } = useTranslation('frontline', { keyPrefix: 'modules.inbox' });
  const maximumBytes =
    Number.parseInt(
      localStorage.getItem('erxes_env_REACT_APP_FILE_UPLOAD_MAX_SIZE') || '',
      10,
    ) || 20 * 1024 * 1024;
  const upload = useErxesUpload({ maxFiles: 10, maxFileSize: maximumBytes });
  const { files, setFiles, setErrors, uploadFile } = upload;
  const user = useAtomValue(currentUserState);
  const store = useStore();
  const operationState = ticketAttachmentOperationsState(
    `${user?._id ?? 'anonymous'}:${id}`,
  );
  const [operation, setOperation] = useAtom(operationState);
  const isUploading = operation?.busy ?? false;
  const attemptedFiles = useRef(new WeakSet<File>());
  const previewFiles = useRef<FileWithPreview[]>([]);
  const { updateTicket, loading } = useUpdateTicket();

  useEffect(() => {
    setOperation((previous) => {
      if (
        previous &&
        (previous.busy ||
          isDeeplyEqual(previous.source, attachments, { strict: true }))
      )
        return previous;
      return { source: attachments, attachments, busy: false };
    });
  }, [attachments, setOperation]);

  /** Acquires the user and ticket attachment lock across component remounts. */
  const beginOperation = useCallback(() => {
    const current = store.get(operationState);
    if (current?.busy) return false;
    store.set(operationState, {
      source: attachments,
      attachments,
      ...current,
      busy: true,
    });
    return true;
  }, [attachments, operationState, store]);
  /** Releases the shared attachment lock after an operation settles. */
  const finishOperation = useCallback(() => {
    store.set(
      operationState,
      (current) => current && { ...current, busy: false },
    );
  }, [operationState, store]);

  useEffect(() => {
    const retained = new Set(files.map((file) => file.preview));
    previewFiles.current.forEach((file) => {
      if (file.preview && !retained.has(file.preview)) {
        URL.revokeObjectURL(file.preview);
      }
    });
    previewFiles.current = files;
  }, [files]);
  useEffect(
    () => () => {
      previewFiles.current.forEach((file) => {
        if (file.preview) URL.revokeObjectURL(file.preview);
      });
    },
    [],
  );

  /** Persists the current attachment list and acknowledges a successful save. */
  const handleSave = useCallback(
    async (
      nextAttachments: IAttachment[],
      message = t('attachment-removed'),
    ): Promise<boolean> => {
      const result = await updateTicket({
        variables: {
          _id: id,
          attachments: nextAttachments.map(toAttachmentInput),
        },
        onCompleted: () => toast({ title: message }),
      });
      const saved = Boolean(result.data?.updateTicket);
      if (saved)
        store.set(
          operationState,
          (current) => current && { ...current, attachments: nextAttachments },
        );
      return saved;
    },
    [id, t, toast, updateTicket, operationState, store],
  );

  /** Settles the selected uploads and saves successful files without overlapping writes. */
  const handleUpload = useCallback(
    async (selectedFiles: FileWithPreview[]): Promise<void> => {
      if (!selectedFiles.length || loading || !beginOperation()) return;

      selectedFiles.forEach((file) => attemptedFiles.current.add(file));
      try {
        const results = await Promise.allSettled(
          selectedFiles.map(async (file): Promise<IAttachment> => {
            const result = await uploadFile(file);
            if (!result.url || result.message !== undefined) {
              throw new Error(result.message || t('upload-failed'));
            }

            return {
              url: result.url,
              name: file.name,
              type: file.type,
              size: file.size,
            };
          }),
        );
        const added: IAttachment[] = [];
        const successfulFiles = new Set<FileWithPreview>();
        const failures: { name: string; message: string }[] = [];
        results.forEach((result, index) => {
          const file = selectedFiles[index];
          if (result.status === 'fulfilled') {
            added.push(result.value);
            successfulFiles.add(file);
            return;
          }

          const message =
            result.reason instanceof Error
              ? result.reason.message
              : t('upload-failed');
          failures.push({ name: file.name, message });
          toast({
            title: t('upload-failed'),
            description: `${file.name}: ${message}`,
            variant: 'destructive',
          });
        });
        setErrors(failures);

        if (
          added.length &&
          (await handleSave(
            [
              ...(store.get(operationState)?.attachments ?? attachments),
              ...added,
            ],
            t('file-uploaded-successfully'),
          ))
        ) {
          setFiles((current) =>
            current.filter((file) => !successfulFiles.has(file)),
          );
        }
      } catch (error) {
        toast({
          title: t('upload-failed'),
          description: error instanceof Error ? error.message : undefined,
          variant: 'destructive',
        });
      } finally {
        finishOperation();
      }
    },
    [
      handleSave,
      loading,
      setErrors,
      setFiles,
      t,
      toast,
      uploadFile,
      beginOperation,
      finishOperation,
      operationState,
      store,
      attachments,
    ],
  );

  useEffect(() => {
    const added = files.filter(
      (file) => !file.errors.length && !attemptedFiles.current.has(file),
    );
    if (!isUploading && !loading && added.length) {
      handleUpload(added);
    }
  }, [files, handleUpload, isUploading, loading]);

  /** Requests approval before removing a ticket attachment. */
  const handleConfirmRemove = (attachment: IAttachment): Promise<boolean> =>
    new Promise((resolve) => {
      confirm({
        message: `Are you sure you want to delete "${attachment.name}"?`,
      })
        .then(() => resolve(true))
        .catch(() => resolve(false));
    });

  return (
    <Attachments.Root
      initialAttachments={operation?.attachments ?? attachments}
      onRemove={async (attachment) => {
        if (loading || !beginOperation()) return false;
        try {
          const remaining = (
            store.get(operationState)?.attachments ?? attachments
          ).filter((item) => item.url !== attachment.url);
          return await handleSave(remaining);
        } finally {
          finishOperation();
        }
      }}
      confirmRemove={handleConfirmRemove}
      isLoading={loading || isUploading}
    >
      <fieldset disabled={isUploading || loading} className="contents">
        <Dropzone
          {...upload}
          loading={isUploading || loading}
          onUpload={() =>
            handleUpload(files.filter((file) => !file.errors.length))
          }
          className={cn(
            (isUploading || loading) && 'pointer-events-none opacity-50',
          )}
        >
          <DropzoneEmptyState />
          <DropzoneContent />
        </Dropzone>
        <Attachments.Files />
        <Attachments.Preview />
        <Attachments.Video />
        <Attachments.Audio />
      </fieldset>
    </Attachments.Root>
  );
};
