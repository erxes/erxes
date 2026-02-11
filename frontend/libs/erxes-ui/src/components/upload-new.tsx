import {
  IconCheck,
  IconFile,
  IconFileSpreadsheet,
  IconFileText,
  IconFileZip,
  IconHeadphones,
  IconPhoto,
  IconUpload,
  IconVideo,
  IconX,
} from '@tabler/icons-react';
import { UseErxesUploadReturn } from 'erxes-ui/hooks/use-upload-new';
import { cn } from 'erxes-ui/lib';
import { createContext, useCallback, useContext } from 'react';
import { Spinner } from './spinner';
import { Button } from './button';

export const getFileIcon = (fileType: string, fileName: string) => {
  if (
    fileType.includes('pdf') ||
    fileName.endsWith('.pdf') ||
    fileType.includes('word') ||
    fileName.endsWith('.doc') ||
    fileName.endsWith('.docx')
  ) {
    return <IconFileText className="size-4 opacity-60" />;
  } else if (
    fileType.includes('zip') ||
    fileType.includes('archive') ||
    fileName.endsWith('.zip') ||
    fileName.endsWith('.rar')
  ) {
    return <IconFileZip className="size-4 opacity-60" />;
  } else if (
    fileType.includes('excel') ||
    fileName.endsWith('.xls') ||
    fileName.endsWith('.xlsx')
  ) {
    return <IconFileSpreadsheet className="size-4 opacity-60" />;
  } else if (fileType.includes('video/')) {
    return <IconVideo className="size-4 opacity-60" />;
  } else if (fileType.includes('audio/')) {
    return <IconHeadphones className="size-4 opacity-60" />;
  } else if (fileType.startsWith('image/')) {
    return <IconPhoto className="size-4 opacity-60" />;
  }
  return <IconFile className="size-4 opacity-60" />;
};

export const formatBytes = (
  bytes: number,
  decimals = 2,
  size?: 'bytes' | 'KB' | 'MB' | 'GB' | 'TB' | 'PB' | 'EB' | 'ZB' | 'YB',
) => {
  const k = 1000;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  if (bytes === 0 || bytes === undefined)
    return size !== undefined ? `0 ${size}` : '0 bytes';
  const i =
    size !== undefined
      ? sizes.indexOf(size)
      : Math.floor(Math.log(bytes) / Math.log(k));
  return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

type DropzoneContextType = Omit<
  UseErxesUploadReturn,
  'getRootProps' | 'getInputProps'
>;

const DropzoneContext = createContext<DropzoneContextType | undefined>(
  undefined,
);

type DropzoneProps = UseErxesUploadReturn & {
  className?: string;
};

const Dropzone = ({
  className,
  children,
  getRootProps,
  getInputProps,
  ...restProps
}: React.PropsWithChildren<DropzoneProps>) => {
  const isSuccess = restProps.isSuccess;
  const isActive = restProps.isDragActive;
  const isInvalid =
    (restProps.isDragActive && restProps.isDragReject) ||
    (restProps.errors.length > 0 && !restProps.isSuccess) ||
    restProps.files.some((file) => file.errors.length !== 0);

  return (
    <DropzoneContext.Provider value={{ ...restProps }}>
      <div
        {...getRootProps({
          className: cn(
            'shadow-xs rounded-lg p-6 text-center bg-sidebar transition-colors duration-300 text-foreground',
            className,
            isSuccess && 'shadow-focus',
            isActive && 'shadow-focus bg-muted',
            isInvalid && 'bg-destructive/10',
          ),
        })}
      >
        <input {...getInputProps()} />
        {children}
      </div>
    </DropzoneContext.Provider>
  );
};
const DropzoneContent = ({ className }: { className?: string }) => {
  const {
    files,
    setFiles,
    onUpload,
    loading,
    successes,
    errors,
    maxFileSize,
    maxFiles,
    isSuccess,
  } = useDropzoneContext();

  const exceedMaxFiles = files.length > maxFiles;

  const handleRemoveFile = useCallback(
    (fileName: string) => {
      setFiles(files.filter((file) => file.name !== fileName));
    },
    [files, setFiles],
  );

  if (isSuccess) {
    return (
      <div
        className={cn(
          'flex flex-row items-center gap-x-2 justify-center',
          className,
        )}
      >
        <IconCheck size={16} className="text-primary" />
        <p className="text-primary text-sm">
          Successfully uploaded {files.length} file{files.length > 1 ? 's' : ''}
        </p>
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col', className)}>
      {files.map((file, idx) => {
        const fileError = errors.find((e) => e.name === file.name);
        const isSuccessfullyUploaded = !!successes.find((e) => e === file.name);

        return (
          <div
            key={`${file.name}-${idx}`}
            className="flex items-center gap-x-4 border-b py-2 first:mt-4 last:mb-4 "
          >
            {file.type.startsWith('image/') ? (
              <div className="h-10 w-10 rounded border overflow-hidden shrink-0 bg-muted flex items-center justify-center">
                <img
                  src={file.preview}
                  alt={file.name}
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="h-10 w-10 rounded border bg-muted flex items-center justify-center">
                {getFileIcon(file.type, file.name)}
              </div>
            )}

            <div className="shrink grow flex flex-col items-start truncate">
              <p title={file.name} className="text-sm truncate max-w-full">
                {file.name}
              </p>
              {file.errors.length > 0 ? (
                <p className="text-xs text-destructive">
                  {file.errors
                    .map((e) =>
                      e.message.startsWith('File is larger than')
                        ? `File is larger than ${formatBytes(
                            maxFileSize,
                            2,
                          )} (Size: ${formatBytes(file.size, 2)})`
                        : e.message,
                    )
                    .join(', ')}
                </p>
              ) : loading && !isSuccessfullyUploaded ? (
                <p className="text-xs text-muted-foreground">
                  Uploading file...
                </p>
              ) : fileError ? (
                <p className="text-xs text-destructive">
                  Failed to upload: {fileError.message}
                </p>
              ) : isSuccessfullyUploaded ? (
                <p className="text-xs text-primary">
                  Successfully uploaded file
                </p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  {formatBytes(file.size, 2)}
                </p>
              )}
            </div>

            {!loading && !isSuccessfullyUploaded && (
              <Button
                size="icon"
                variant="link"
                className="shrink-0 justify-self-end text-muted-foreground hover:text-foreground"
                onClick={() => handleRemoveFile(file.name)}
              >
                <IconX />
              </Button>
            )}
          </div>
        );
      })}
      {exceedMaxFiles && (
        <p className="text-sm text-left mt-2 text-destructive">
          You may upload only up to {maxFiles} files, please remove{' '}
          {files.length - maxFiles} file
          {files.length - maxFiles > 1 ? 's' : ''}.
        </p>
      )}
      {files.length > 0 && !exceedMaxFiles && (
        <div className="mt-2">
          <Button
            variant="outline"
            onClick={onUpload}
            disabled={files.some((file) => file.errors.length !== 0) || loading}
          >
            {loading ? (
              <>
                <Spinner className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>Upload files</>
            )}
          </Button>
        </div>
      )}
    </div>
  );
};

const DropzoneEmptyState = ({ className }: { className?: string }) => {
  const { maxFiles, maxFileSize, inputRef, isSuccess } = useDropzoneContext();

  if (isSuccess) {
    return null;
  }

  return (
    <div className={cn('flex flex-col items-center gap-y-2', className)}>
      <IconUpload size={20} className="text-muted-foreground" />
      <p className="text-sm">
        Upload{!!maxFiles && maxFiles > 1 ? ` ${maxFiles}` : ''} file
        {!maxFiles || maxFiles > 1 ? 's' : ''}
      </p>
      <div className="flex flex-col items-center gap-y-1">
        <p className="text-xs text-muted-foreground">
          Drag and drop or{' '}
          <span
            onClick={() => inputRef.current?.click()}
            className="underline cursor-pointer transition hover:text-foreground"
          >
            select {maxFiles === 1 ? `file` : 'files'}
          </span>{' '}
          to upload
        </p>
        {maxFileSize !== Number.POSITIVE_INFINITY && (
          <p className="text-xs text-muted-foreground">
            Maximum file size: {formatBytes(maxFileSize, 2)}
          </p>
        )}
      </div>
    </div>
  );
};

const useDropzoneContext = () => {
  const context = useContext(DropzoneContext);

  if (!context) {
    throw new Error('useDropzoneContext must be used within a Dropzone');
  }

  return context;
};

export { Dropzone, DropzoneContent, DropzoneEmptyState, useDropzoneContext };
