import { IconLayoutGrid, IconPhoto, IconX } from '@tabler/icons-react';
import {
  Attachments,
  Button,
  Dialog,
  Dropzone,
  DropzoneContent,
  DropzoneEmptyState,
  cn,
  toast,
  useBlockEditor,
  useErxesUpload,
  type IAttachment,
  type FileWithPreview,
} from 'erxes-ui';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { MouseEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';

type ComposerBlockEditor = ReturnType<typeof useBlockEditor>;
type GalleryBlock = Extract<
  ComposerBlockEditor['document'][number],
  { type: 'gallery' }
>;

const GALLERY_IMAGES_SCHEMA = z.array(
  z.object({ url: z.string().min(1), caption: z.string().optional() }),
);

const getGalleryImages = (
  raw: string,
): z.infer<typeof GALLERY_IMAGES_SCHEMA> => {
  try {
    const result = GALLERY_IMAGES_SCHEMA.safeParse(JSON.parse(raw));
    return result.success ? result.data : [];
  } catch {
    return [];
  }
};

const COLUMN_CLASSES: Record<string, string> = {
  '2': '[&_[role=list]]:grid-cols-2',
  '3': '[&_[role=list]]:grid-cols-2 sm:[&_[role=list]]:grid-cols-3',
  '4': '[&_[role=list]]:grid-cols-2 sm:[&_[role=list]]:grid-cols-4',
};

const ComposerGallery = ({
  block,
  editor,
  disabled,
  onUploadingChange,
}: {
  block: GalleryBlock;
  editor: ComposerBlockEditor;
  disabled: boolean;
  onUploadingChange: (id: string, uploading: boolean) => void;
}) => {
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
    maxFiles: 20,
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
      if (files.some((file) => file.errors.length) || pendingFiles.length > 20)
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

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        if (!uploading) setOpen(value);
      }}
    >
      <div className="flex min-w-0 max-w-full items-center gap-2 rounded-xl border bg-muted/35 p-1.5 pr-2 shadow-xs">
        <Dialog.Trigger asChild>
          <Button
            type="button"
            variant="ghost"
            disabled={disabled}
            className="h-auto min-w-0 justify-start gap-2 p-0"
          >
            <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-background text-muted-foreground">
              <IconPhoto className="size-4" />
            </span>
            <span className="min-w-0 max-w-40 text-left">
              <span className="block truncate text-xs font-medium">
                {t('gallery', 'Gallery')}
              </span>
              <span className="block text-[11px] text-muted-foreground">
                {t('gallery-image-count', '{{count}} images', {
                  count: images.length,
                })}
              </span>
            </span>
          </Button>
        </Dialog.Trigger>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          disabled={disabled}
          aria-label={t('remove-gallery', 'Remove gallery')}
          className="size-7 shrink-0"
          onClick={removeGallery}
        >
          <IconX className="size-4" />
        </Button>
      </div>
      <Dialog.Content
        data-composer-gallery-dialog
        className="flex max-h-[85dvh] w-[calc(100%-2rem)] max-w-3xl flex-col gap-0 overflow-hidden p-0"
      >
        <Dialog.Header className="shrink-0 border-b px-6 py-4">
          <Dialog.Title className="flex items-center gap-2">
            <IconPhoto className="size-5 text-primary" />
            {t('gallery', 'Gallery')}
          </Dialog.Title>
          <Dialog.Description>
            {t(
              'gallery-description',
              'Add images and choose how they appear in your message.',
            )}
          </Dialog.Description>
        </Dialog.Header>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-6">
          {images.length > 0 && (
            <Attachments.Root
              initialAttachments={attachments}
              onSave={updateImages}
              confirmRemove={() => !uploading && !disabled}
              isLoading={uploading || disabled}
            >
              <Attachments.Preview
                heading=""
                className={cn(
                  'mb-6 p-0 [&_[role=list]]:grid [&_[role=list]]:gap-3 [&_[role=listitem]]:aspect-square [&_[role=listitem]]:h-auto [&_[role=listitem]]:w-full [&_.absolute>button]:hidden [&_[role=listitem]>button]:flex',
                  COLUMN_CLASSES[block.props.columns] || COLUMN_CLASSES['3'],
                )}
              />
            </Attachments.Root>
          )}
          <Dropzone
            {...upload}
            className={cn(
              'cursor-pointer',
              (uploading || disabled) && 'pointer-events-none opacity-50',
            )}
            loading={uploading || disabled}
            getRootProps={(props) => {
              const rootProps = upload.getRootProps(props);
              return {
                ...rootProps,
                onClick: (event: MouseEvent<HTMLElement>) => {
                  rootProps.onClick?.(event);
                  if (
                    uploading ||
                    disabled ||
                    !(event.target instanceof Element)
                  )
                    return;
                  if (event.target.closest('button, input, .underline')) return;
                  upload.open();
                },
              };
            }}
            onUpload={() =>
              handleUpload(pendingFiles.filter((file) => !file.errors.length))
            }
          >
            <DropzoneEmptyState />
            <DropzoneContent />
          </Dropzone>
        </div>
        <Dialog.Footer className="shrink-0 items-center border-t px-6 py-4 sm:justify-between">
          <div
            className="flex items-center gap-1"
            role="group"
            aria-label={t('gallery-columns', 'Gallery columns')}
          >
            <IconLayoutGrid className="mr-2 size-4 text-muted-foreground" />
            {[2, 3, 4].map((columns) => (
              <Button
                key={columns}
                type="button"
                size="sm"
                variant={
                  block.props.columns === String(columns)
                    ? 'secondary'
                    : 'ghost'
                }
                disabled={uploading || disabled}
                aria-label={t('gallery-column-count', '{{count}} columns', {
                  count: columns,
                })}
                aria-pressed={block.props.columns === String(columns)}
                onClick={() =>
                  editor.updateBlock(block, {
                    props: { columns: String(columns) },
                  })
                }
              >
                {columns}
              </Button>
            ))}
          </div>
          <Dialog.Close asChild>
            <Button type="button" disabled={uploading}>
              {t('done', 'Done')}
            </Button>
          </Dialog.Close>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog>
  );
};

export const ComposerGalleries = ({
  editor,
  disabled,
  onUploadingChange,
}: {
  editor: ComposerBlockEditor;
  disabled: boolean;
  onUploadingChange: (id: string, uploading: boolean) => void;
}) => {
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

  if (!galleries.length) return null;

  return (
    <div className="flex flex-wrap gap-2 border-b border-border/50 p-2 sm:px-3">
      {galleries.map((block) => (
        <ComposerGallery
          key={block.id}
          block={block}
          editor={editor}
          disabled={disabled}
          onUploadingChange={onUploadingChange}
        />
      ))}
    </div>
  );
};
