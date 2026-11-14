import { IconTrash, IconUpload, IconUserCircle } from '@tabler/icons-react';
import type { ChangeEvent, ComponentPropsWithoutRef, RefObject, ReactNode } from 'react';
import { createContext, useContext, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, type ButtonProps } from './button';
import { Dialog } from './dialog';
import { Spinner } from './spinner';
import { useToast } from '../hooks/use-toast';
import { useUpload } from '../hooks/use-upload';
import { cn } from '../lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';
import { readImage } from '../utils/core';

/** The stored address, with what is known about the file; `url` is empty after a removal. */
type UploadValue = {
  url: string;
  name?: string;
  size?: number;
  type?: string;
  duration?: number;
};

type IUploadContext = {
  url: string | undefined;
  multiple?: boolean;
  onChange: (value: UploadValue) => void;
  setPreviewUrl: (previewUrl: string | undefined) => void;
  previewRef: RefObject<string | null>;
  fileInputRef: RefObject<HTMLInputElement | null>;
  chooseFile: () => void;
  setIsImageFocused: (isImageFocused: boolean) => void;
};

const UploadContext = createContext<IUploadContext | null>(null);

const useUploadContext = () => {
  const context = useContext(UploadContext);

  if (!context) throw new Error('Upload parts must be used within Upload.Root');

  return context;
};

type UploadRootProps = {
  value: string;
  onChange: (value: UploadValue) => void;
  multiple?: boolean;
} & Omit<ComponentPropsWithoutRef<'div'>, 'onChange'>;

const UploadRoot = ({
  ref,
  className,
  value,
  onChange,
  multiple,
  ...rest
}: UploadRootProps & React.RefAttributes<HTMLDivElement>) => {
  const previewRef = useRef<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | undefined>();
  const [isImageFocused, setIsImageFocused] = useState(false);
  const url = previewUrl ?? value;

  return (
    <UploadContext.Provider
      value={{
        url,
        multiple,
        onChange,
        fileInputRef,
        previewRef,
        setPreviewUrl,
        chooseFile: () => fileInputRef.current?.click(),
        setIsImageFocused,
      }}
    >
      <Dialog open={isImageFocused} onOpenChange={setIsImageFocused}>
        <Dialog.Content className="max-w-none w-auto bg-transparent border-0 p-0">
          <img
            src={readImage(url)}
            alt="Focused view"
            className="max-h-[90vh] max-w-[90vw] object-contain"
          />
        </Dialog.Content>
      </Dialog>
      <div ref={ref} className={cn('flex gap-4', className)} {...rest} />
    </UploadContext.Provider>
  );
};

const uploadPreviewVariants = cva('relative overflow-hidden', {
  variants: {
    variant: {
      default: '',
      // A plain circle: no padding or drop shadow, which read lopsided at avatar size.
      avatar: 'rounded-full border border-border p-0 shadow-none',
    },
    size: { default: 'size-16', sm: 'size-8' },
  },
  defaultVariants: { variant: 'default', size: 'default' },
});

type UploadPreviewProps = VariantProps<typeof uploadPreviewVariants> & {
  className?: string;
  onUploadStart?: (fileCount?: number) => void;
  onUploadProgress?: () => void;
  onAllUploadsComplete?: () => void;
};

/** Uploads the chosen files, reporting each one and the end of the batch. */
const useUploadChosenFiles = ({
  onUploadStart,
  onUploadProgress,
  onAllUploadsComplete,
}: Omit<UploadPreviewProps, 'className' | 'variant' | 'size'>) => {
  const { isLoading, upload } = useUpload();
  const { onChange, setPreviewUrl, previewRef } = useUploadContext();

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { files } = event.target;

    if (!files?.length) return;

    if (previewRef.current) URL.revokeObjectURL(previewRef.current);

    const total = files.length;
    let finished = 0;

    onUploadStart?.(total);
    upload({
      files,
      afterUpload: ({ response, fileInfo }) => {
        onChange({ url: response, ...fileInfo });
        finished += 1;
        onUploadProgress?.();

        if (finished === total) onAllUploadsComplete?.();
      },
      afterRead: ({ result }) => {
        if (typeof result === 'string') setPreviewUrl(result);
      },
    });
  };

  return { isLoading, handleFileChange };
};

const UploadPreview = ({ className, variant, size, ...callbacks }: UploadPreviewProps) => {
  const { url, multiple, fileInputRef, chooseFile, setIsImageFocused } = useUploadContext();
  const { isLoading, handleFileChange } = useUploadChosenFiles(callbacks);

  return (
    <>
      <div className={cn('relative inline-flex', className)}>
        <Button
          type="button"
          variant="outline"
          className={uploadPreviewVariants({ variant, size })}
          onClick={url ? () => setIsImageFocused(true) : chooseFile}
          aria-label={url ? 'Change image' : 'Upload image'}
        >
          {isLoading && <Spinner />}
          {!isLoading && url && (
            <img
              className="h-full w-full object-cover absolute"
              src={readImage(url)}
              alt="Preview of uploaded"
            />
          )}
          {!isLoading && !url && (
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
          multiple={multiple}
        />
      </div>
      <output className="sr-only" aria-live="polite">
        {url ? 'Image uploaded and preview available' : 'No image uploaded'}
      </output>
    </>
  );
};

const UploadButton = ({
  ref,
  children,
  className,
  ...props
}: ButtonProps & { children?: ReactNode } & React.RefAttributes<HTMLButtonElement>) => {
  const { chooseFile } = useUploadContext();
  const { t } = useTranslation('settings', { keyPrefix: 'profile' });

  return (
    <Button ref={ref} className={cn('flex', className)} {...props} onClick={chooseFile}>
      {children ?? (
        <>
          <IconUpload /> {t('upload')}
        </>
      )}
    </Button>
  );
};

const RemoveButton = ({
  ref,
  children,
  className,
  ...props
}: ButtonProps & { children?: ReactNode } & React.RefAttributes<HTMLButtonElement>) => {
  const { remove } = useUpload();
  const { url, previewRef, onChange, setPreviewUrl } = useUploadContext();
  const { toast } = useToast();

  if (!url) return <div />;

  const handleRemove = () => {
    if (previewRef.current) {
      URL.revokeObjectURL(previewRef.current);
      previewRef.current = null;
    }

    setPreviewUrl(undefined);
    onChange({ url: '' });

    // A preview that never reached the storage has nothing to delete.
    if (url.startsWith('data:') || url.startsWith('blob:')) return;

    void remove({
      fileName: url,
      afterRemove: ({ status }) => {
        if (status === 'ok') return;

        toast({
          title: 'Could not delete the stored file',
          description: 'It has been removed here, but the server still holds a copy.',
          variant: 'destructive',
        });
      },
    });
  };

  return (
    <Button ref={ref} className={cn('flex', className)} {...props} onClick={handleRemove}>
      {children ?? (
        <>
          <IconTrash /> Remove
        </>
      )}
    </Button>
  );
};

export const Upload = {
  Root: UploadRoot,
  Preview: UploadPreview,
  Button: UploadButton,
  RemoveButton,
};
