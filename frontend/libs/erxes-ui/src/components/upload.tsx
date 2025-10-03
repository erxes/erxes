import { Button, Dialog } from 'erxes-ui/components';
import { IconTrash, IconUpload, IconUserCircle } from '@tabler/icons-react';
import React, {
  MutableRefObject,
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from 'react';

import { ButtonProps } from './button';
import { cn } from '../lib/utils';
import { readImage } from 'erxes-ui/utils/core';
import { useUpload } from 'erxes-ui/hooks';

type IUploadContext = {
  url: string | undefined;
  multiple?: boolean;
  onChange: (value: any) => void;
  setPreviewUrl: (previewUrl: string | undefined) => void;
  previewRef: MutableRefObject<string | null>;
  fileInputRef: MutableRefObject<HTMLInputElement | null>;
  handleThumbnailClick: () => void;
  ImageFocus: () => void;
  isImageFocused: boolean;
  setIsImageFocused: (isImageFocused: boolean) => void;
};

const UploadContext = createContext<IUploadContext | null>(null);

type UploadPreviewProps = {
  value: string;
  onChange: (value: { url: string; fileInfo: any }) => void;
  multiple?: boolean;
} & React.ComponentPropsWithoutRef<'div'>;

const UploadRoot = React.forwardRef<HTMLDivElement, UploadPreviewProps>(
  ({ className, ...props }, ref) => {
    const { value, onChange, multiple } = props;

    const previewRef = useRef<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [previewUrl, setPreviewUrl] = useState<string | undefined>();

    const url = previewUrl || value;

    const [isImageFocused, setIsImageFocused] = useState(false);

    const handleThumbnailClick = useCallback(() => {
      fileInputRef.current?.click();
    }, []);

    const ImageFocus = useCallback(() => {
      setIsImageFocused(true);
    }, []);

    return (
      <UploadContext.Provider
        value={{
          url,
          multiple,
          onChange,
          fileInputRef,
          previewRef,
          setPreviewUrl,
          handleThumbnailClick,
          ImageFocus,
          isImageFocused,
          setIsImageFocused,
        }}
      >
        <Dialog open={isImageFocused} onOpenChange={setIsImageFocused}>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 bg-accent" />
            <Dialog.Content className="fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] max-w-none w-auto bg-transparent border-0 p-0">
              <img
                src={readImage(url)}
                alt="Focused view"
                className="max-h-[90vh] max-w-[90vw] object-contain"
              />
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog>
        <div ref={ref} className={cn('flex gap-4', className)} {...props} />
      </UploadContext.Provider>
    );
  },
);

UploadRoot.displayName = 'UploadRoot';

type UploadPreviewPropsExtended = React.ComponentPropsWithoutRef<'div'> & {
  onUploadStart?: (fileCount?: number) => void;
  onUploadProgress?: () => void;
  onAllUploadsComplete?: () => void;
};
const UploadPreview = React.forwardRef<
  HTMLDivElement,
  UploadPreviewPropsExtended
>(
  (
    {
      className,
      onUploadStart,
      onUploadProgress,
      onAllUploadsComplete,
      ...props
    },
    ref,
  ) => {
    const { isLoading, upload } = useUpload();

    const uploadContext = useContext(UploadContext);

    if (!uploadContext) {
      throw new Error('UploadContext must be used within an UploadRoot');
    }

    const {
      url,
      multiple,
      onChange,
      setPreviewUrl,
      fileInputRef,
      previewRef,
      handleThumbnailClick,
      ImageFocus,
    } = uploadContext;

    const totalFilesCountRef = useRef(0);
    const finishedFilesCountRef = useRef(0);

    const handleFileChange = useCallback(
      (event: React.ChangeEvent<HTMLInputElement>) => {
        const { files } = event.target;

        if (!files || files.length === 0) return;

        if (previewRef.current) {
          URL.revokeObjectURL(previewRef.current);
        }

        totalFilesCountRef.current = files.length;
        finishedFilesCountRef.current = 0;

        onUploadStart?.(files.length || 0);

        upload({
          files,

          afterUpload: ({ response, fileInfo }) => {
            onChange && onChange({ url: response, ...fileInfo });

            finishedFilesCountRef.current += 1;
            onUploadProgress?.();

            if (finishedFilesCountRef.current === totalFilesCountRef.current) {
              // All files uploaded, fire batch upload end (once)
              onAllUploadsComplete?.();
            }
          },

          afterRead: ({ result }) => {
            setPreviewUrl(result);
          },
        });
      },
      [
        previewRef,
        upload,
        onChange,
        setPreviewUrl,
        onUploadStart,
        onUploadProgress,
        onAllUploadsComplete,
      ],
    );

    return (
      <>
        <div className={cn('relative inline-flex', className)}>
          <Button
            type="button"
            variant="outline"
            className="relative size-16 overflow-hidden"
            onClick={!url ? handleThumbnailClick : ImageFocus}
            aria-label={url ? 'Change image' : 'Upload image'}
          >
            {isLoading ? (
              <div
                className="animate-spin inline-block size-6 border-[3px] border-current border-t-transparent text-gray-600 rounded-full dark:text-gray-500"
                role="status"
                aria-label="loading"
              >
                <span className="sr-only">Loading...</span>
              </div>
            ) : url ? (
              <img
                className="h-full w-full object-cover absolute"
                src={readImage(url)}
                alt="Preview of uploaded"
              />
            ) : (
              <div aria-hidden="true">
                <IconUserCircle className="opacity-60" size={16} />
              </div>
            )}
          </Button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            // accept="image/*"
            // aria-label="Upload image file"
            multiple={multiple}
          />
        </div>
        <div className="sr-only" aria-live="polite" role="status">
          {url ? 'Image uploaded and preview available' : 'No image uploaded'}
        </div>
      </>
    );
  },
);

UploadPreview.displayName = 'UploadPreview';

const UploadButton = React.forwardRef<
  HTMLButtonElement,
  ButtonProps & { children?: React.ReactNode }
>(({ children, className, ...props }, ref) => {
  const uploadContext = useContext(UploadContext);

  if (!uploadContext) {
    throw new Error('UploadContext must be used within an UploadRoot');
  }

  const { handleThumbnailClick } = uploadContext;

  return (
    <Button
      ref={ref}
      className={cn('flex', className)}
      {...props}
      onClick={handleThumbnailClick}
    >
      {children || (
        <>
          <IconUpload /> Upload
        </>
      )}
    </Button>
  );
});

UploadButton.displayName = 'UploadButton';

const RemoveButton = React.forwardRef<
  HTMLButtonElement,
  ButtonProps & { children?: React.ReactNode }
>(({ children, className, ...props }, ref) => {
  const { remove } = useUpload();

  const uploadContext = useContext(UploadContext);

  if (!uploadContext) {
    throw new Error('UploadContext must be used within an UploadRoot');
  }

  const { url, previewRef, onChange, setPreviewUrl } = uploadContext;

  if (!url) {
    return <div />;
  }

  const handleRemove = () => {
    const urlArray = url.split('/');

    const fileName =
      urlArray.length === 1 ? url : urlArray[urlArray.length - 1];

    if (previewRef.current) {
      URL.revokeObjectURL(previewRef.current);
      previewRef.current = null;
    }

    remove({
      fileName,

      afterRemove: ({ status }) => {
        if (status === 'ok') {
          setPreviewUrl(undefined);
          onChange('');
        }
      },
    });
  };

  return (
    <Button
      ref={ref}
      className={cn('flex', className)}
      {...props}
      onClick={handleRemove}
    >
      {children || (
        <>
          <IconTrash /> Remove
        </>
      )}
    </Button>
  );
});

RemoveButton.displayName = 'RemoveButton';

export const Upload = {
  Root: UploadRoot,
  Preview: UploadPreview,
  Button: UploadButton,
  RemoveButton: RemoveButton,
};
