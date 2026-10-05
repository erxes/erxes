import {
  toast,
  useErxesUpload,
  type IAttachment,
  type FileWithPreview,
} from 'erxes-ui';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type {
  ComposerBlockEditor,
  ComposerGalleryProps,
  ComposerGalleryResult,
  GalleryBlock,
} from '@/inbox/conversations/conversation-detail/types/composer';
import { getGalleryImages } from '@/inbox/conversations/conversation-detail/utils/composer';
import { MAX_GALLERY_UPLOAD_FILES } from '@/inbox/conversations/conversation-detail/constants/composer';

export const useComposerGallery = ({
  block,
  editor,
  disabled,
  onUploadingChange,
}: ComposerGalleryProps): ComposerGalleryResult => {
  const { t } = useTranslation('frontline');
  const [open, setOpen] = useState(
    () => !getGalleryImages(block.props.images).length,
  );
  const [uploading, setUploading] = useState(false);
  const uploadingRef = useRef(false);
  const mountedRef = useRef(true);
  const previewFilesRef = useRef<FileWithPreview[]>([]);
  const attemptedFiles = useRef(new WeakSet<File>());
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      previewFilesRef.current.forEach((file) => {
        if (file.preview) URL.revokeObjectURL(file.preview);
      });
      previewFilesRef.current = [];
      onUploadingChange(block.id, false);
    };
  }, [block.id, onUploadingChange]);
  const images = useMemo(
    () => getGalleryImages(block.props.images),
    [block.props.images],
  );
  const attachments = useMemo(
    () =>
      images.map((image) => ({
        url: image.url,
        name: image.caption || image.url.split('/').pop() || 'image',
        type: 'image/*',
        size: 0,
      })),
    [images],
  );
  const upload = useErxesUpload({
    allowedMimeTypes: ['image/*'],
    maxFiles: MAX_GALLERY_UPLOAD_FILES,
  });

  const updateImages = (remaining: IAttachment[]): void => {
    editor.updateBlock(block, {
      props: {
        images: JSON.stringify(
          remaining.map(
            ({ url }) => images.find((image) => image.url === url) || { url },
          ),
        ),
      },
    });
    toast({ title: t('attachment-removed', 'Attachment removed') });
  };

  const { files: pendingFiles, setFiles } = upload;
  useEffect(() => {
    const retained = new Set(pendingFiles.map((file) => file.preview));
    previewFilesRef.current.forEach((file) => {
      if (file.preview && !retained.has(file.preview))
        URL.revokeObjectURL(file.preview);
    });
    previewFilesRef.current = pendingFiles;
  }, [pendingFiles]);

  const handleUpload = useCallback(
    async (files: FileWithPreview[]): Promise<void> => {
      const uploadFile = editor.uploadFile;
      if (!uploadFile || uploadingRef.current || disabled || !files.length)
        return;
      if (files.some((file) => file.errors.length)) return;

      files.forEach((file) => attemptedFiles.current.add(file));
      uploadingRef.current = true;
      setUploading(true);
      onUploadingChange(block.id, true);
      try {
        const results: PromiseSettledResult<{ url: string }>[] = [];
        for (
          let offset = 0;
          offset < files.length;
          offset += MAX_GALLERY_UPLOAD_FILES
        ) {
          if (!mountedRef.current) return;
          const batch = files.slice(offset, offset + MAX_GALLERY_UPLOAD_FILES);
          results.push(
            ...(await Promise.allSettled(
              batch.map(async (file) => {
                const result = await uploadFile(file);
                const url =
                  typeof result === 'string' ? result : result.props?.url;
                if (typeof url !== 'string' || !url) throw new Error(file.name);
                return { url };
              }),
            )),
          );
        }
        if (!mountedRef.current) return;
        const added = results.flatMap((result) =>
          result.status === 'fulfilled' ? [result.value] : [],
        );
        const currentBlock = editor.getBlock(block.id);
        if (added.length && currentBlock?.type === 'gallery') {
          editor.updateBlock(currentBlock, {
            props: {
              images: JSON.stringify([
                ...getGalleryImages(currentBlock.props.images),
                ...added,
              ]),
            },
          });
        }
        const failed = files.filter(
          (_, index) => results[index].status === 'rejected',
        );
        setFiles((current) =>
          current.filter(
            (file) => !files.includes(file) || failed.includes(file),
          ),
        );
        if (failed.length) {
          toast({
            title: t(
              'gallery-upload-failed',
              'Failed to upload gallery images',
            ),
            description: failed.map((file) => file.name).join(', '),
            variant: 'destructive',
          });
        } else if (added.length) {
          toast({
            title: t('gallery-images-added', 'Images added to gallery'),
          });
        }
      } finally {
        uploadingRef.current = false;
        if (mountedRef.current) {
          setUploading(false);
          onUploadingChange(block.id, false);
        }
      }
    },
    [block.id, disabled, editor, onUploadingChange, setFiles, t],
  );

  useEffect(() => {
    const added = pendingFiles.filter(
      (file) => !file.errors.length && !attemptedFiles.current.has(file),
    );
    if (!uploading && added.length)
      handleUpload(added).catch(() => {
        toast({
          title: t('gallery-upload-failed', 'Failed to upload gallery images'),
          variant: 'destructive',
        });
      });
  }, [handleUpload, pendingFiles, uploading, t]);

  const removeGallery = (): void => {
    if (uploadingRef.current || disabled) return;
    editor.removeBlocks([block]);
    toast({ title: t('attachment-removed', 'Attachment removed') });
  };

  const onOpenChange = (value: boolean): void => {
    if (!uploading) setOpen(value);
  };

  return {
    open,
    onOpenChange,
    uploading,
    images,
    attachments,
    upload,
    pendingFiles,
    handleUpload,
    updateImages,
    removeGallery,
  };
};

export const useComposerGalleries = (
  editor: ComposerBlockEditor,
): GalleryBlock[] => {
  const [galleries, setGalleries] = useState<GalleryBlock[]>([]);

  useEffect(() => {
    const updateGalleries = (): void => {
      setGalleries(
        editor.document.filter(
          (block): block is GalleryBlock => block.type === 'gallery',
        ),
      );
    };
    updateGalleries();
    return editor.onChange(updateGalleries);
  }, [editor]);

  return galleries;
};
