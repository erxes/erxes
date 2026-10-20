import { cn } from 'erxes-ui';
import { useImageFallback } from '../hooks/useImageFallback';
import { IFile } from '../types';
import { FileTypeIcon } from './FileTypeIcon';

export const FileThumbnail = ({
  file,
  className,
}: {
  file: IFile;
  className?: string;
}) => {
  const { showImage, onError } = useImageFallback(file.thumbnailUrl);

  return (
    <span
      className={cn(
        'flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-sm bg-muted',
        className,
      )}
    >
      {showImage ? (
        <img
          src={file.thumbnailUrl || undefined}
          alt=""
          loading="lazy"
          className="size-full object-cover"
          onError={onError}
        />
      ) : (
        <FileTypeIcon
          mimeType={file.mimeType}
          className="size-4 text-muted-foreground"
        />
      )}
    </span>
  );
};
