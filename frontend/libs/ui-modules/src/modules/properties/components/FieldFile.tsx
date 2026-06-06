import { Button, Spinner, useUpload, toast } from 'erxes-ui';
import { REACT_APP_API_URL } from 'erxes-ui/utils';
import { IconPaperclip, IconTrash } from '@tabler/icons-react';
import { useRef, useState, useEffect } from 'react';
import { SpecificFieldProps } from './Field';

export const FieldFile = (props: SpecificFieldProps) => {
  const { value, handleChange, loading } = props;
  const [currentValue, setCurrentValue] = useState(value || null);
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
    <div
      className="flex h-8 w-full items-center rounded-sm bg-background px-3 shadow-xs text-sm cursor-pointer border border-input"
      onClick={() => !currentValue?.url && !isLoading && !loading && inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        onChange={handleUpload}
      />
      {currentValue?.url ? (
        <>
          <a
            href={`${REACT_APP_API_URL}/read-file?key=${encodeURIComponent(currentValue.url)}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1 text-foreground hover:underline flex-1 truncate"
            onClick={(e) => e.stopPropagation()}
          >
            <IconPaperclip className="size-4 shrink-0" />
            <span className="truncate">{currentValue.name || 'File'}</span>
          </a>
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
    </div>
  );
};
