import { IconDownload, IconExternalLink } from '@tabler/icons-react';
import { Button, formatBytes, Spinner } from 'erxes-ui';
import { lazy, Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { useFilePreview } from '../hooks/useFilePreview';
import { useImageFallback } from '../hooks/useImageFallback';
import { IFile } from '../types';
import { FileTypeIcon } from './FileTypeIcon';

// Lazy: each viewer pulls in a large library.
const FilePdfPreview = lazy(() =>
  import('./FilePdfPreview').then((m) => ({ default: m.FilePdfPreview })),
);
const FileSheetPreview = lazy(() =>
  import('./FileSheetPreview').then((m) => ({ default: m.FileSheetPreview })),
);
const FileDocxPreview = lazy(() =>
  import('./FileDocxPreview').then((m) => ({ default: m.FileDocxPreview })),
);

const PreviewSpinner = () => (
  <div className="flex h-full w-full items-center justify-center">
    <Spinner />
  </div>
);

type TFilePreviewProps = {
  file: IFile;
  onDownload: () => void;
};

export const FilePreview = ({ file, onDownload }: TFilePreviewProps) => {
  const { t } = useTranslation('files');
  const { kind, url, text, canOpenInTab, loading, error } =
    useFilePreview(file);
  const image = useImageFallback(kind === 'image' ? url : null);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return <div className="p-4 text-sm text-destructive">{error}</div>;
  }

  if (kind === 'none' || !url || (kind === 'image' && !image.showImage)) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center">
        <FileTypeIcon
          mimeType={file.mimeType}
          className="size-12 text-muted-foreground"
        />
        <div className="text-sm font-medium">{file.name}</div>
        <div className="text-xs text-muted-foreground">
          {formatBytes(file.size, 1)} · {t('no-preview')}
        </div>
        <Button onClick={onDownload}>
          <IconDownload />
          {t('download')}
        </Button>
      </div>
    );
  }

  return (
    <div className="relative flex h-full flex-col">
      <div className="flex min-h-0 flex-1 items-center justify-center overflow-auto bg-muted/40">
        {kind === 'image' && (
          <img
            src={url}
            alt={file.name}
            className="max-h-full max-w-full object-contain"
            onError={image.onError}
          />
        )}
        <Suspense fallback={<PreviewSpinner />}>
          {kind === 'pdf' && <FilePdfPreview url={url} />}
          {kind === 'sheet' && (
            <FileSheetPreview url={url} isCsv={file.mimeType === 'text/csv'} />
          )}
          {kind === 'docx' && <FileDocxPreview url={url} />}
        </Suspense>
        {kind === 'video' && (
          <video src={url} controls className="max-h-full max-w-full" />
        )}
        {kind === 'audio' && (
          <audio src={url} controls className="w-full max-w-md" />
        )}
        {kind === 'text' && (
          <pre className="h-full w-full overflow-auto whitespace-pre-wrap p-4 text-xs">
            {text}
          </pre>
        )}
      </div>
      {canOpenInTab && (
        <Button
          variant="secondary"
          size="icon"
          className="absolute right-3 top-3 shadow-sm"
          title={t('open-in-new-tab')}
          asChild
        >
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={t('open-in-new-tab')}
          >
            <IconExternalLink />
          </a>
        </Button>
      )}
    </div>
  );
};
