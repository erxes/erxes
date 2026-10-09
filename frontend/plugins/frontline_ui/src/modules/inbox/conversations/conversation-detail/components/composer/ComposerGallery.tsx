import { IconLayoutGrid, IconPhoto, IconX } from '@tabler/icons-react';
import {
  Attachments,
  Button,
  Dialog,
  Dropzone,
  DropzoneContent,
  DropzoneEmptyState,
  Spinner,
  cn,
} from 'erxes-ui';
import type { MouseEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { useComposerGallery } from '@/inbox/conversations/conversation-detail/hooks/composer/useComposerGallery';
import {
  GALLERY_COLUMN_CLASSES,
  GALLERY_COLUMN_OPTIONS,
  MAX_GALLERY_UPLOAD_FILES,
} from '@/inbox/conversations/conversation-detail/constants/composer';
import type {
  ComposerGalleryProps,
  ComposerGalleryResult,
} from '@/inbox/conversations/conversation-detail/types/composer';

const ComposerGalleryIcon = () => (
  <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-background text-muted-foreground">
    <IconPhoto className="size-4" />
  </span>
);

const ComposerGalleryLabel = ({ imageCount }: { imageCount: number }) => {
  const { t } = useTranslation('frontline');
  return (
    <span className="min-w-0 max-w-40 text-left">
      <span className="block truncate text-xs font-medium">
        {t('gallery', 'Gallery')}
      </span>
      <span className="block text-[11px] text-muted-foreground">
        {t('gallery-image-count', '{{count}} images', {
          count: imageCount,
        })}
      </span>
    </span>
  );
};

const ComposerGallerySummary = ({
  imageCount,
  disabled,
  onRemove,
}: {
  imageCount: number;
  disabled: boolean;
  onRemove: () => void;
}) => {
  const { t } = useTranslation('frontline');
  return (
    <div className="flex min-w-0 max-w-full items-center gap-2 rounded-xl border bg-muted/35 p-1.5 pr-2 shadow-xs">
      <Dialog.Trigger asChild>
        <Button
          type="button"
          variant="ghost"
          disabled={disabled}
          className="h-auto min-w-0 justify-start gap-2 p-0"
        >
          <ComposerGalleryIcon />
          <ComposerGalleryLabel imageCount={imageCount} />
        </Button>
      </Dialog.Trigger>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        disabled={disabled}
        aria-label={t('remove-gallery', 'Remove gallery')}
        className="size-7 shrink-0"
        onClick={onRemove}
      >
        <IconX className="size-4" />
      </Button>
    </div>
  );
};

const ComposerGalleryContent = ({
  columns,
  disabled,
  gallery,
}: {
  columns: string;
  disabled: boolean;
  gallery: ComposerGalleryResult;
}) => {
  const {
    images,
    attachments,
    updateImages,
    uploading,
    upload,
    pendingFiles,
    handleUpload,
  } = gallery;
  const { t } = useTranslation('frontline');
  const retryUpload = (): Promise<void> =>
    handleUpload(pendingFiles.filter((file) => !file.errors.length));

  if (uploading) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="flex min-h-52 flex-1 flex-col items-center justify-center gap-3 p-6 text-sm text-muted-foreground"
      >
        <Spinner size="lg" />
        <span>{t('uploading', 'Uploading...')}</span>
      </div>
    );
  }

  return (
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
              GALLERY_COLUMN_CLASSES[columns] || GALLERY_COLUMN_CLASSES['3'],
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
              if (uploading || disabled || !(event.target instanceof Element))
                return;
              if (event.target.closest('button, input, .underline')) return;
              upload.open();
            },
          };
        }}
        onUpload={retryUpload}
      >
        <DropzoneEmptyState />
        <DropzoneContent />
      </Dropzone>
      {pendingFiles.length > MAX_GALLERY_UPLOAD_FILES && (
        <Button
          type="button"
          variant="outline"
          className="mt-2"
          disabled={
            uploading ||
            disabled ||
            pendingFiles.every((file) => file.errors.length > 0)
          }
          onClick={retryUpload}
        >
          {t('retry')}
        </Button>
      )}
    </div>
  );
};

const ComposerGalleryColumns = ({
  block,
  editor,
  disabled,
}: Pick<ComposerGalleryProps, 'block' | 'editor' | 'disabled'>) => {
  const { t } = useTranslation('frontline');
  return (
    <fieldset
      className="flex items-center gap-1"
      aria-label={t('gallery-columns', 'Gallery columns')}
    >
      <IconLayoutGrid className="mr-2 size-4 text-muted-foreground" />
      {GALLERY_COLUMN_OPTIONS.map((columns) => (
        <Button
          key={columns}
          type="button"
          size="sm"
          variant={
            block.props.columns === String(columns) ? 'secondary' : 'ghost'
          }
          disabled={disabled}
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
    </fieldset>
  );
};

const ComposerGalleryHeader = () => {
  const { t } = useTranslation('frontline');
  return (
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
  );
};

const ComposerGalleryDone = ({ disabled }: { disabled: boolean }) => {
  const { t } = useTranslation('frontline');
  return (
    <Dialog.Close asChild>
      <Button type="button" disabled={disabled}>
        {t('done', 'Done')}
      </Button>
    </Dialog.Close>
  );
};

export const ComposerGallery = (props: ComposerGalleryProps) => {
  const { block, editor, disabled } = props;
  const gallery = useComposerGallery(props);
  const { open, onOpenChange, uploading, images, removeGallery } = gallery;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <ComposerGallerySummary
        imageCount={images.length}
        disabled={disabled || uploading}
        onRemove={removeGallery}
      />
      <Dialog.Content
        data-composer-gallery-dialog
        className="flex max-h-[85dvh] w-[calc(100%-2rem)] max-w-3xl flex-col gap-0 overflow-hidden p-0"
      >
        <ComposerGalleryHeader />
        <ComposerGalleryContent
          columns={block.props.columns}
          disabled={disabled}
          gallery={gallery}
        />
        <Dialog.Footer className="shrink-0 items-center border-t px-6 py-4 sm:justify-between">
          <ComposerGalleryColumns
            block={block}
            editor={editor}
            disabled={uploading || disabled}
          />
          <ComposerGalleryDone disabled={uploading} />
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog>
  );
};
