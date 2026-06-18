import {
  IconDownload,
  IconFile,
  IconFileCode,
  IconFileSpreadsheet,
  IconFileText,
  IconFileZip,
  IconPdf,
} from '@tabler/icons-react';
import { Dialog } from 'erxes-ui';
import React, { createContext, useContext, useMemo } from 'react';

type FileVariant =
  | 'image'
  | 'text'
  | 'pdf'
  | 'spreadsheet'
  | 'archive'
  | 'code'
  | 'other';

const getFileVariant = (url: string): FileVariant => {
  const ext = url.split('?')[0].split('.').pop()?.toLowerCase() ?? '';
  if (/^(jpg|jpeg|png|gif|webp|svg|bmp|ico|avif|tiff?)$/.test(ext))
    return 'image';
  if (/^(txt|md|log|csv|tsv)$/.test(ext)) return 'text';
  if (ext === 'pdf') return 'pdf';
  if (/^(xls|xlsx|ods|numbers)$/.test(ext)) return 'spreadsheet';
  if (/^(zip|tar|gz|rar|7z|bz2)$/.test(ext)) return 'archive';
  if (/^(js|ts|jsx|tsx|json|xml|html|css|py|rb|go|rs|java|c|cpp|sh)$/.test(ext))
    return 'code';
  return 'other';
};

const FileVariantIcon = ({
  variant,
  className,
}: {
  variant: FileVariant;
  className?: string;
}) => {
  const props = { className };
  switch (variant) {
    case 'pdf':
      return <IconPdf {...props} />;
    case 'text':
      return <IconFileText {...props} />;
    case 'spreadsheet':
      return <IconFileSpreadsheet {...props} />;
    case 'archive':
      return <IconFileZip {...props} />;
    case 'code':
      return <IconFileCode {...props} />;
    default:
      return <IconFile {...props} />;
  }
};

interface AttachmentsPreviewProps {
  value: unknown;
  readImage: (path: string) => string;
  children: React.ReactNode;
}

interface ContextProps {
  files: string[];
  readImage: (path: string) => string;
}

const AttachmentsContext = createContext<ContextProps | undefined>(undefined);

const useAttachments = () => {
  const context = useContext(AttachmentsContext);
  if (!context) {
    throw new Error(
      'AttachmentsPreview subcomponents must be wrapped in <AttachmentsPreview />',
    );
  }
  return context;
};

export const AttachmentsPreview = ({
  value,
  readImage,
  children,
}: AttachmentsPreviewProps) => {
  const files = useMemo((): string[] => {
    if (!value) return [];

    if (typeof value === 'string' && value.trim() !== '') {
      try {
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed)) return parsed;
        if (parsed && typeof parsed === 'object' && 'url' in parsed) {
          return [parsed.url];
        }
      } catch {
        return [value];
      }
    }

    if (Array.isArray(value)) return value;
    if (typeof value === 'object' && value !== null && 'url' in value) {
      return [(value as { url: string }).url];
    }

    return [];
  }, [value]);

  return (
    <AttachmentsContext.Provider value={{ files, readImage }}>
      {children}
    </AttachmentsContext.Provider>
  );
};

const InlineCell = ({
  fallback = 'No file uploaded',
}: {
  fallback?: string;
}) => {
  const { files, readImage } = useAttachments();

  if (files.length === 0) {
    return <span className="text-muted-foreground text-sm">{fallback}</span>;
  }

  return (
    <div className="flex flex-nowrap gap-1.5 items-center overflow-x-auto hide-scroll snap-x">
      {files.map((file, i) => {
        const resolvedUrl = readImage(decodeURIComponent(file));
        const variant = getFileVariant(file);

        if (variant === 'image') {
          return (
            <Dialog key={`${file}-${i}`}>
              <Dialog.Trigger asChild>
                <div className="block group relative snap-start cursor-pointer">
                  <img
                    src={resolvedUrl}
                    alt="attachment preview"
                    className="w-6 h-6 min-w-6 min-h-6 object-cover rounded border bg-muted shadow-sm"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              </Dialog.Trigger>
              <Dialog.Portal>
                <Dialog.Content className="p-0 border-none max-w-2xl bg-transparent aspect-square">
                  <div className="flex items-center justify-end absolute -top-8 right-0 transition-all hover:bg-background/20 rounded-sm">
                    <a
                      href={resolvedUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block group relative transition-transform hover:scale-105 text-accent-foreground"
                    >
                      <IconDownload />
                    </a>
                  </div>
                  <div className="w-full h-full col-span-1 relative overflow-hidden rounded-xs bg-background/10">
                    <img
                      src={resolvedUrl}
                      alt={`attachment-${i + 1}`}
                      className="object-contain transition-all duration-500 ease-in-out absolute inset-0 w-full h-full"
                    />
                  </div>
                </Dialog.Content>
              </Dialog.Portal>
            </Dialog>
          );
        }

        return (
          <a
            key={`${file}-${i}`}
            href={resolvedUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center w-6 h-6 min-w-6 min-h-6 rounded border bg-muted shadow-sm text-muted-foreground hover:text-primary transition-colors snap-start"
            title={file.split('/').pop()}
          >
            <FileVariantIcon variant={variant} className="w-4 h-4" />
          </a>
        );
      })}
    </div>
  );
};

const Details = () => {
  const { files, readImage } = useAttachments();

  if (files.length === 0) {
    return (
      <div className="flex items-center justify-center p-6 border border-dashed rounded-lg bg-muted/30">
        <span className="text-sm text-muted-foreground">
          No attachments available
        </span>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
      {files.map((file, i) => {
        const resolvedUrl = readImage(decodeURIComponent(file));
        const fileName = file.split('/').pop() || `Attachment-${i + 1}`;
        const variant = getFileVariant(file);

        return (
          <div
            key={`${file}-${i}`}
            className="group relative border rounded-lg overflow-hidden bg-card shadow-sm flex flex-col"
          >
            <div className="aspect-square w-full bg-muted flex items-center justify-center overflow-hidden border-b">
              {variant === 'image' ? (
                <img
                  src={resolvedUrl}
                  alt={fileName}
                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                />
              ) : (
                <FileVariantIcon
                  variant={variant}
                  className="w-12 h-12 text-muted-foreground"
                />
              )}
            </div>
            <div className="p-2 flex flex-col justify-between flex-1 gap-2">
              <span
                className="text-xs font-medium truncate text-card-foreground"
                title={fileName}
              >
                {fileName}
              </span>
              <a
                href={resolvedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-medium text-primary hover:underline mt-auto block text-right"
              >
                {variant === 'image' ? 'View full size →' : 'Download →'}
              </a>
            </div>
          </div>
        );
      })}
    </div>
  );
};

AttachmentsPreview.InlineCell = InlineCell;
AttachmentsPreview.Details = Details;
