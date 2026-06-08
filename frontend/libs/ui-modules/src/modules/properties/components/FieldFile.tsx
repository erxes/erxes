import { Button, Spinner, useUpload, toast, Dialog } from 'erxes-ui';
import { REACT_APP_API_URL } from 'erxes-ui/utils';
import { IconPaperclip, IconTrash, IconDownload } from '@tabler/icons-react';
import { useRef, useState, useEffect } from 'react';
import { SpecificFieldProps } from './Field';

export const FieldFile = (props: SpecificFieldProps) => {
  const { value, handleChange, loading } = props;
  const [currentValue, setCurrentValue] = useState(value || null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const { upload, remove, isLoading } = useUpload();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setCurrentValue(value || null);
  }, [value]);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (files[0].size > 20 * 1024 * 1024) {
      toast({ description: 'File size must be less than 20MB', variant: 'destructive' });
      if (inputRef.current) inputRef.current.value = '';
      return;
    }

    upload({
      files,
      afterUpload: ({ status, response, fileInfo }) => {
        if (status === 'ok') {
          const newValue = { url: response, name: fileInfo.name, type: fileInfo.type, size: fileInfo.size };
          setCurrentValue(newValue);
          handleChange(newValue);
        } else {
          if (inputRef.current) inputRef.current.value = '';
        }
      },
    });
  };

  const handleRemove = () => {
    if (currentValue?.url) {
      remove({
        fileName: currentValue.url,
        afterRemove: ({ status }) => {
          if (status === 'ok') {
            setCurrentValue(null);
            handleChange(null);
            if (inputRef.current) inputRef.current.value = '';
          } else {
            toast({ description: 'Failed to delete file', variant: 'destructive' });
          }
        },
      });
    } else {
      setCurrentValue(null);
      handleChange(null);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <>
      <label
        htmlFor="property-file-input"
        className="flex h-8 w-full items-center rounded-sm bg-background px-3 shadow-xs text-sm cursor-pointer border border-input"
        onClick={(e) => {
          if (currentValue?.url || isLoading || loading) e.preventDefault();
        }}
      >
        <input
          id="property-file-input"
          ref={inputRef}
          type="file"
          className="hidden"
          onChange={handleUpload}
        />
        {currentValue?.url ? (
          <>
            <button
              className="flex items-center gap-1 text-foreground hover:underline flex-1 truncate text-sm"
              onClick={(e) => { e.stopPropagation(); setPreviewLoading(true); setPreviewOpen(true); }}
            >
              <IconPaperclip className="size-4 shrink-0" />
              <span className="truncate">{currentValue.name || 'File'}</span>
            </button>
            <Button
              variant="ghost"
              size="icon"
              className="size-5 ml-1 shrink-0"
              onClick={(e) => { e.stopPropagation(); handleRemove(); }}
              disabled={loading || isLoading}
            >
              {isLoading ? <Spinner size="sm" /> : <IconTrash className="size-3" />}
            </Button>
          </>
        ) : (
          <span className="flex items-center gap-1 text-accent-foreground/70 hover:text-foreground transition-colors flex-1">
            {isLoading ? <Spinner size="sm" /> : (
              <><IconPaperclip className="size-4" /> Upload file</>
            )}
          </span>
        )}
      </label>

    <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
      <Dialog.Content className="max-w-3xl">
        <Dialog.Header>
          <div className="flex items-center justify-between">
            <Dialog.Title>{currentValue?.name || 'File'}</Dialog.Title>
            <a
              href={`${REACT_APP_API_URL}/read-file?key=${encodeURIComponent(currentValue?.url || '')}`}
              download={currentValue?.name || 'file'}
            >
              <Button variant="ghost" size="icon">
                <IconDownload className="size-4" />
              </Button>
            </a>
          </div>
        </Dialog.Header>
        {currentValue?.type?.startsWith('image/') ? (
          <div className="relative min-h-40 flex items-center justify-center">
            {previewLoading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Spinner />
              </div>
            )}
            <img
              src={`${REACT_APP_API_URL}/read-file?key=${encodeURIComponent(currentValue.url)}&inline=true`}
              alt={currentValue.name}
              className="w-full rounded object-contain max-h-[70vh]"
              onLoadStart={() => setPreviewLoading(true)}
              onLoad={() => setPreviewLoading(false)}
              onError={() => {
                setPreviewLoading(false);
                toast({ description: 'Failed to load preview', variant: 'destructive' });
              }}
            />
          </div>
        ) : currentValue?.type === 'application/pdf' ? (
          <div className="relative min-h-40">
            {previewLoading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Spinner />
              </div>
            )}
            <iframe
              src={`${REACT_APP_API_URL}/read-file?key=${encodeURIComponent(currentValue.url)}&inline=true`}
              className="w-full h-[70vh] rounded"
              onLoad={() => setPreviewLoading(false)}
              onError={() => {
                setPreviewLoading(false);
                toast({ description: 'Failed to load preview', variant: 'destructive' });
              }}
            />
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 py-8">
            <IconPaperclip className="size-12 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">{currentValue?.name}</p>
            <a
              href={`${REACT_APP_API_URL}/read-file?key=${encodeURIComponent(currentValue?.url || '')}&inline=true`}
              target="_blank"
              rel="noreferrer"
            >
              <Button variant="outline">Open file</Button>
            </a>
          </div>
        )}
      </Dialog.Content>
    </Dialog>
    </>
  );
};
