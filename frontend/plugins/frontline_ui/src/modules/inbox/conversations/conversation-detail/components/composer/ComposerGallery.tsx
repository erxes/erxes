import { IconLayoutGrid, IconPhoto, IconX } from '@tabler/icons-react';
import {
  Attachments,
  Button,
  Dialog,
  Dropzone,
  DropzoneContent,
  DropzoneEmptyState,
  cn,
} from 'erxes-ui';
import type { MouseEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { useComposerGallery } from '../../hooks/composer/useComposerGallery';
import {
  GALLERY_COLUMN_CLASSES,
  GALLERY_COLUMN_OPTIONS,
} from '../../constants/composer';
import type { ComposerGalleryProps } from '../../types/composer';

export const ComposerGallery = (props: ComposerGalleryProps) => {
  const { block, editor, disabled } = props;
  const { t } = useTranslation('frontline');
  const {
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
  } = useComposerGallery(props);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
                  GALLERY_COLUMN_CLASSES[block.props.columns] ||
                    GALLERY_COLUMN_CLASSES['3'],
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
            {GALLERY_COLUMN_OPTIONS.map((columns) => (
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
