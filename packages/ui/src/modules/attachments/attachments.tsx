import { IconFile, IconMusic, IconPaperclip, IconPhoto } from '@tabler/icons-react';
import { Spinner } from 'erxes-ui/components/spinner';
import { Upload } from 'erxes-ui/components/upload';
import { cn } from 'erxes-ui/lib/utils';
import { RecordTableInlineCell } from 'erxes-ui/modules/record-table/components/RecordTableCellInline';
import { readImage } from 'erxes-ui/utils/core';
import { useRef, useState } from 'react';
import { AttachmentPreview, AttachmentVideo } from './attachment-media';
import { Heading, RemoveAttachmentButton, ScrollTrack } from './attachment-parts';
import { AttachmentRoot, useAttachmentContext } from './context';
import type { IAttachment } from './types';

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

type AttachmentFilesProps = {
  /** Override the accepted MIME type set. */
  fileTypes?: Set<string>;
  heading?: string;
};

/** Document attachments as links. */
const AttachmentFiles = ({
  fileTypes = DEFAULT_FILE_TYPES,
  heading = 'File Attachments',
}: AttachmentFilesProps) => {
  const { attachments } = useAttachmentContext();
  const files = attachments.filter((item) => fileTypes.has(item.type));

  if (files.length === 0) return null;

  return (
    <div className="py-4 px-8">
      <Heading>{heading}</Heading>
      <ScrollTrack label="File attachments">
        {files.map((attachment) => (
          <li
            key={attachment.url}
            className="relative group p-2 bg-background text-primary rounded-md flex items-center gap-2 shrink-0"
          >
            <a
              href={readImage(decodeURIComponent(attachment.url))}
              target="_blank"
              rel="noreferrer"
              className="text-sm truncate max-w-40"
              title={attachment.name}
            >
              {attachment.name}
            </a>
            <RemoveAttachmentButton attachment={attachment} />
          </li>
        ))}
      </ScrollTrack>
    </div>
  );
};

type AttachmentAudioProps = {
  heading?: string;
};

/** Audio attachments with players. */
const AttachmentAudio = ({ heading = 'Audio Attachments' }: AttachmentAudioProps) => {
  const { attachments } = useAttachmentContext();
  const audio = attachments.filter((item) => item.type.startsWith('audio/'));

  if (audio.length === 0) return null;

  return (
    <div className="py-4 px-8">
      <Heading>{heading}</Heading>
      <ul className="flex flex-col gap-2" aria-label={heading}>
        {audio.map((attachment) => (
          <li
            key={attachment.url}
            className="group relative w-72 max-w-full rounded-lg border border-border shadow-sm bg-background p-2"
          >
            <div className="flex items-center gap-1.5 pb-1.5 pr-5">
              <IconMusic size={14} className="text-muted-foreground shrink-0" aria-hidden />
              <span className="text-xs font-medium truncate" title={attachment.name}>
                {attachment.name}
              </span>
            </div>
            <audio className="w-full" src={readImage(attachment.url)} controls preload="metadata">
              <track kind="captions" />
            </audio>
            <RemoveAttachmentButton attachment={attachment} />
          </li>
        ))}
      </ul>
    </div>
  );
};

type AttachmentUploaderProps = {
  /** Called once a batch of files has uploaded, with all attachments. */
  onSave?: (attachments: IAttachment[]) => Promise<void> | void;
  id?: string;
  label?: string;
};

/** Uploads files through the host's file storage and adds them as attachments. */
const AttachmentUploader = ({ onSave, id, label = 'Add attachments' }: AttachmentUploaderProps) => {
  const { addAttachment, attachments } = useAttachmentContext();
  const [progress, setProgress] = useState<{ uploaded: number; total: number } | null>(null);
  const before = useRef<IAttachment[]>([]);
  const batch = useRef<IAttachment[]>([]);

  return (
    <Upload.Root
      id={id}
      value=""
      multiple
      className={cn('items-center', { 'pointer-events-none opacity-50': progress })}
      onChange={({ url, name, size, type, duration }) => {
        if (!url) return;

        const attachment = {
          url,
          name: name ?? url.split('/').pop() ?? url,
          size: size ?? 0,
          type: type ?? '',
          duration,
        };

        batch.current.push(attachment);
        addAttachment(attachment);
      }}
    >
      <Upload.Preview
        className="hidden"
        onUploadStart={(count) => {
          before.current = attachments;
          batch.current = [];
          setProgress({ uploaded: 0, total: count ?? 0 });
        }}
        onUploadProgress={() =>
          setProgress((prev) => prev && { ...prev, uploaded: prev.uploaded + 1 })
        }
        onAllUploadsComplete={() => {
          setProgress(null);
          void onSave?.([...before.current, ...batch.current]);
        }}
      />
      <Upload.Button
        size="sm"
        variant="ghost"
        type="button"
        className="flex items-center gap-1 cursor-pointer text-sm"
      >
        {progress ? (
          <>
            <Spinner />
            <span aria-live="polite">
              {progress.uploaded}/{progress.total}
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

type AttachmentsInlineProps = {
  attachments: IAttachment[];
  /** Override the file MIME type set used to identify non-image files. */
  fileTypes?: Set<string>;
};

const CountPill = ({ icon, count }: { icon: React.ReactNode; count: number }) => (
  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-muted text-muted-foreground text-xs font-medium">
    {icon}
    {count}
  </span>
);

/** Read-only counts of images and files, for table cells. */
const AttachmentsInline = ({
  attachments,
  fileTypes = DEFAULT_FILE_TYPES,
}: AttachmentsInlineProps) => {
  const images = attachments.filter((item) => item.type.startsWith('image/')).length;
  const files = attachments.filter((item) => fileTypes.has(item.type)).length;

  return (
    <RecordTableInlineCell>
      {images === 0 && files === 0 ? (
        <span className="text-muted-foreground select-none">—</span>
      ) : (
        <div className="flex items-center gap-1.5">
          {images > 0 && <CountPill icon={<IconPhoto size={13} aria-hidden />} count={images} />}
          {files > 0 && <CountPill icon={<IconFile size={13} aria-hidden />} count={files} />}
        </div>
      )}
    </RecordTableInlineCell>
  );
};

export const Attachments = {
  Root: AttachmentRoot,
  Files: AttachmentFiles,
  Preview: AttachmentPreview,
  Video: AttachmentVideo,
  Audio: AttachmentAudio,
  Uploader: AttachmentUploader,
  Inline: AttachmentsInline,
} as const;
