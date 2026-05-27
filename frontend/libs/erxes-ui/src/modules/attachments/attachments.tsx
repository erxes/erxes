import { Button, Dialog, Spinner, Upload, cn, readImage } from 'erxes-ui/index';
import {
  IconChevronLeft,
  IconChevronRight,
  IconDownload,
  IconFile,
  IconPaperclip,
  IconPhoto,
  IconX,
  IconZoomIn,
} from '@tabler/icons-react';
import { useEffect, useRef, useState } from 'react';

import {
  AttachmentRoot,
  useAttachmentContext,
  type AttachmentRootProps,
} from './context';
import { RecordTableInlineCell } from 'erxes-ui/modules/record-table';
import type { IAttachment } from './types';

// ---------------------------------------------------------------------------
// Shared constants
// ---------------------------------------------------------------------------

const SCROLL_STEP = 150;

const DEFAULT_FILE_TYPES = new Set([
  'text/plain',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
]);

function stripTypename<T extends object>(obj: T): T {
  const { __typename, ...rest } = obj as T & { __typename?: unknown };
  return rest as T;
}

// ---------------------------------------------------------------------------
// Shared scroll track — used by both Files and Preview
// ---------------------------------------------------------------------------

type ScrollTrackProps = {
  children: React.ReactNode;
  label: string;
};

const ScrollTrack = ({ children, label }: ScrollTrackProps) => {
  const ref = useRef<HTMLDivElement>(null);

  const scroll = (dir: 'left' | 'right') =>
    ref.current?.scrollBy({
      left: dir === 'left' ? -SCROLL_STEP : SCROLL_STEP,
      behavior: 'smooth',
    });

  return (
    <div className="relative">
      <div className="absolute top-1/2 -left-4 -translate-y-1/2 hidden lg:block z-10">
        <button
          className="bg-background p-1 rounded-full shadow"
          onClick={() => scroll('left')}
          aria-label={`Scroll ${label} left`}
        >
          <IconChevronLeft size={20} />
        </button>
      </div>

      <div
        ref={ref}
        className="overflow-x-auto flex gap-4 scroll-smooth"
        role="list"
        aria-label={label}
      >
        {children}
      </div>

      <div className="absolute top-1/2 -right-4 -translate-y-1/2 hidden lg:block z-10">
        <button
          className="bg-background p-1 rounded-full shadow"
          onClick={() => scroll('right')}
          aria-label={`Scroll ${label} right`}
        >
          <IconChevronRight size={20} />
        </button>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Attachments.Files
// ---------------------------------------------------------------------------

export type AttachmentFilesProps = {
  /** Override the accepted MIME type set. */
  fileTypes?: Set<string>;
  heading?: string;
};

const AttachmentFiles = ({
  fileTypes = DEFAULT_FILE_TYPES,
  heading = 'File Attachments',
}: AttachmentFilesProps) => {
  const { attachments, handleRemoveAttachment, removingUrl, isLoading } =
    useAttachmentContext();

  const fileAttachments = attachments.filter(
    (a) => a?.type != null && fileTypes.has(a.type),
  );

  if (fileAttachments.length === 0) return null;

  return (
    <div className="py-4 px-8">
      <h4 className="uppercase text-sm text-muted-foreground pb-4">
        {heading}
      </h4>
      <ScrollTrack label="File attachments">
        {fileAttachments.map((attachment) => {
          const isRemoving = removingUrl === attachment.url;
          const url = readImage(decodeURIComponent(attachment.url));
          return (
            <div
              key={attachment.url}
              role="listitem"
              className="relative group p-2 bg-background text-primary rounded-md flex items-center gap-2 shrink-0"
            >
              <a
                href={url}
                target="_blank"
                rel="noreferrer"
                className="text-sm truncate max-w-40"
                title={attachment.name}
              >
                {attachment.name}
              </a>
              <Button
                variant="ghost"
                disabled={isLoading && isRemoving}
                onClick={(e) => handleRemoveAttachment(e, attachment)}
                className="absolute hidden group-hover:flex items-center justify-center top-1 right-1 bg-destructive/40 hover:bg-destructive/80 text-background rounded-full p-1 w-5 h-5 shadow-md z-10"
                aria-label={`Remove ${attachment.name}`}
              >
                <IconX size={10} aria-hidden />
              </Button>
            </div>
          );
        })}
      </ScrollTrack>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Attachments.Preview  (image lightbox)
// ---------------------------------------------------------------------------

export type AttachmentPreviewProps = {
  heading?: string;
};

const AttachmentPreview = ({
  heading = 'Media Attachments',
}: AttachmentPreviewProps) => {
  const [open, setOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const { attachments, handleRemoveAttachment, removingUrl, isLoading } =
    useAttachmentContext();

  const mediaAttachments = attachments.filter(
    (a) => a?.type != null && a.type.startsWith('image/'),
  );

  const current = mediaAttachments[currentIndex];

  // Clamp index when list shrinks
  useEffect(() => {
    if (
      currentIndex >= mediaAttachments.length &&
      mediaAttachments.length > 0
    ) {
      setCurrentIndex(mediaAttachments.length - 1);
    }
  }, [mediaAttachments.length, currentIndex]);

  // Keyboard nav — only when dialog is open
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight')
        setCurrentIndex((i) => (i + 1) % mediaAttachments.length);
      if (e.key === 'ArrowLeft')
        setCurrentIndex((i) => (i === 0 ? mediaAttachments.length - 1 : i - 1));
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, mediaAttachments.length]);

  if (mediaAttachments.length === 0) return null;

  const prev = () =>
    setCurrentIndex((i) => (i === 0 ? mediaAttachments.length - 1 : i - 1));
  const next = () => setCurrentIndex((i) => (i + 1) % mediaAttachments.length);

  return (
    <div className="py-4 px-8">
      <h4 className="uppercase text-sm text-muted-foreground pb-4">
        {heading}
      </h4>

      <ScrollTrack label="Media attachments">
        {mediaAttachments.map((attachment, index) => {
          const isRemoving = removingUrl === attachment.url;
          return (
            <div
              key={attachment.url}
              role="listitem"
              className="group relative w-36 h-36 rounded-lg border border-border shadow-md shrink-0 cursor-zoom-in"
              onClick={() => {
                setCurrentIndex(index);
                setOpen(true);
              }}
            >
              <img
                className="w-full h-full object-cover rounded-lg"
                src={readImage(attachment.url)}
                alt={attachment.name}
                loading="lazy"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-background/30 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                {isLoading && isRemoving ? (
                  <Spinner />
                ) : (
                  <IconZoomIn
                    size={28}
                    className="text-primary-foreground"
                    aria-hidden
                  />
                )}
              </div>
              <Button
                variant="ghost"
                disabled={isLoading && isRemoving}
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveAttachment(e, attachment);
                }}
                className="absolute hidden group-hover:flex items-center justify-center top-1 right-1 bg-destructive/40 hover:bg-destructive/80 text-background rounded-full p-1 w-5 h-5 shadow-md z-10"
                aria-label={`Remove ${attachment.name}`}
              >
                <IconX size={10} aria-hidden />
              </Button>
            </div>
          );
        })}
      </ScrollTrack>

      {/* Lightbox */}
      <Dialog open={open} onOpenChange={setOpen}>
        <Dialog.Content className="bg-transparent max-w-fit shadow-none border-0">
          <Button
            variant={'secondary'}
            size={'icon'}
            className="absolute top-6 -right-4 bg-background/80 hover:bg-background p-1.5 rounded-full z-50 transition-colors"
            onClick={() => setOpen(false)}
            aria-label="Close lightbox"
          >
            <IconX size={20} />
          </Button>
          <Button
            variant={'secondary'}
            size={'icon'}
            aria-label="Download file"
            asChild
            role="link"
          >
            <a
              target={'__blank'}
              href={readImage(current.url)}
              className="absolute top-20 -right-4 -translate-y-1/2 bg-background/80 hover:bg-background p-1.5 rounded-full z-50 transition-colors"
            >
              <IconDownload />
            </a>
          </Button>

          <Button
            variant={'secondary'}
            size={'icon'}
            className="absolute -left-4 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background p-1.5 rounded-full z-50 transition-colors"
            onClick={prev}
            aria-label="Previous image"
          >
            <IconChevronLeft size={24} />
          </Button>

          {current && (
            <img
              key={current.url}
              src={readImage(current.url)}
              alt={current.name}
              className="max-w-[90vw] max-h-[90vh] object-contain rounded shadow-2xl select-none"
              draggable={false}
            />
          )}

          <Button
            variant={'secondary'}
            size={'icon'}
            className="absolute -right-4 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background p-1.5 rounded-full z-50 transition-colors"
            onClick={next}
            aria-label="Next image"
          >
            <IconChevronRight size={24} />
          </Button>

          {mediaAttachments.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-background/70 text-foreground text-xs px-3 py-1 rounded-full">
              {currentIndex + 1} / {mediaAttachments.length}
            </div>
          )}
        </Dialog.Content>
      </Dialog>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Attachments.Uploader
// ---------------------------------------------------------------------------

export type AttachmentUploaderProps = {
  onSave?: (attachments: IAttachment[]) => Promise<void> | void;
  id?: string;
  label?: string;
};

const AttachmentUploader = ({
  onSave,
  id,
  label = 'Add attachments',
}: AttachmentUploaderProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({
    uploaded: 0,
    total: 0,
  });

  const { addAttachment, attachments } = useAttachmentContext();

  const attachmentsRef = useRef(attachments);
  useEffect(() => {
    attachmentsRef.current = attachments;
  }, [attachments]);

  // Batch-complete — fires once all files in a batch finish
  useEffect(() => {
    if (
      uploadProgress.total > 0 &&
      uploadProgress.uploaded === uploadProgress.total
    ) {
      const cleaned = attachmentsRef.current.map(stripTypename);
      onSave?.(cleaned);
      setUploadProgress({ uploaded: 0, total: 0 });
      setIsUploading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uploadProgress]);

  return (
    <Upload.Root
      value=""
      multiple
      className={cn('items-center', {
        'pointer-events-none opacity-50': isUploading,
      })}
      onChange={(fileInfo) => {
        if (fileInfo && 'url' in fileInfo) {
          addAttachment(fileInfo as unknown as IAttachment);
        }
      }}
    >
      <Upload.Preview
        className="hidden"
        onUploadStart={(count) => {
          setIsUploading(true);
          setUploadProgress({ uploaded: 0, total: count ?? 0 });
        }}
        onUploadProgress={() =>
          setUploadProgress((prev) => ({
            ...prev,
            uploaded: prev.uploaded + 1,
          }))
        }
        onAllUploadsComplete={() => setIsUploading(false)}
      />
      <Upload.Button
        size="sm"
        variant="ghost"
        type="button"
        className="flex items-center gap-1 cursor-pointer text-sm"
      >
        {isUploading ? (
          <>
            <Spinner />
            <span aria-live="polite">
              {uploadProgress.uploaded}/{uploadProgress.total}
            </span>
          </>
        ) : (
          <IconPaperclip size={16} aria-hidden />
        )}
        {label}
      </Upload.Button>
    </Upload.Root>
  );
};

// ---------------------------------------------------------------------------
// Attachments.Inline  (read-only summary pills for table cells)
// ---------------------------------------------------------------------------

export type AttachmentsInlineProps = {
  attachments: IAttachment[];
  /** Override the file MIME type set used to identify non-image files. */
  fileTypes?: Set<string>;
};

const AttachmentsInline = ({
  attachments,
  fileTypes = DEFAULT_FILE_TYPES,
}: AttachmentsInlineProps) => {
  const images = attachments.filter((a) => a?.type?.startsWith('image/'));
  const files = attachments.filter(
    (a) => a?.type != null && fileTypes.has(a.type),
  );

  return (
    <RecordTableInlineCell>
      {images.length === 0 && files.length === 0 ? (
        <span className="text-muted-foreground select-none">—</span>
      ) : (
        <div className="flex items-center gap-1.5">
          {images.length > 0 && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-muted text-muted-foreground text-xs font-medium">
              <IconPhoto size={13} aria-hidden />
              {images.length}
            </span>
          )}
          {files.length > 0 && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-muted text-muted-foreground text-xs font-medium">
              <IconFile size={13} aria-hidden />
              {files.length}
            </span>
          )}
        </div>
      )}
    </RecordTableInlineCell>
  );
};

// ---------------------------------------------------------------------------
// Attachments namespace export
// ---------------------------------------------------------------------------

export const Attachments = {
  Root: AttachmentRoot,
  Files: AttachmentFiles,
  Preview: AttachmentPreview,
  Uploader: AttachmentUploader,
  Inline: AttachmentsInline,
} as const;

export type { AttachmentRootProps };
