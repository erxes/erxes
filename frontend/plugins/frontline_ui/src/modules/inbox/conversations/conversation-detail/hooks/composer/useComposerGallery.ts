import type { ComposerBlockEditor } from '../../types/composer';
import {
  toast,
  useErxesUpload,
  type IAttachment,
  type FileWithPreview,
} from 'erxes-ui';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type {
  ComposerGalleryProps,
  ComposerGalleryResult,
  GalleryBlock,
} from '../../types/composer';
import { getGalleryImages } from '../../utils/composer';
import { MAX_GALLERY_UPLOAD_FILES } from '../../constants/composer';

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
  const attemptedFiles = useRef(new WeakSet<File>());
  useEffect(
    () => () => onUploadingChange(block.id, false),
    [block.id, onUploadingChange],
  );
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
  const handleUpload = useCallback(
    async (files: FileWithPreview[]): Promise<void> => {
      const uploadFile = editor.uploadFile;
      if (!uploadFile || uploadingRef.current || disabled || !files.length)
        return;
      if (
        files.some((file) => file.errors.length) ||
        pendingFiles.length > MAX_GALLERY_UPLOAD_FILES
      )
        return;

      files.forEach((file) => attemptedFiles.current.add(file));
      uploadingRef.current = true;
      setUploading(true);
      onUploadingChange(block.id, true);
      try {
        const results = await Promise.allSettled(
          files.map(async (file) => {
            const result = await uploadFile(file);
            const url = typeof result === 'string' ? result : result.props?.url;
            if (typeof url !== 'string' || !url) throw new Error(file.name);
            return { url };
          }),
        );
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
        files
          .filter((file) => !failed.includes(file))
          .forEach((file) => {
            if (file.preview) URL.revokeObjectURL(file.preview);
          });
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
        setUploading(false);
        onUploadingChange(block.id, false);
      }
    },
    [
      block.id,
      disabled,
      editor,
      onUploadingChange,
      pendingFiles.length,
      setFiles,
      t,
    ],
  );

  useEffect(() => {
    const added = pendingFiles.filter(
      (file) => !file.errors.length && !attemptedFiles.current.has(file),
    );
    if (!uploading && added.length) void handleUpload(added);
  }, [handleUpload, pendingFiles, uploading]);

  const removeGallery = (): void => {
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
