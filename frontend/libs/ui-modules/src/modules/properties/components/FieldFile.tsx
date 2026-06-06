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
    <div className="flex items-center gap-2">
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        onChange={handleUpload}
      />
      {currentValue?.url ? (
        <div className="flex items-center gap-2">
          <a
            href={`${REACT_APP_API_URL}/read-file?key=${encodeURIComponent(currentValue.url)}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1 text-sm text-primary hover:underline"
          >
            <IconPaperclip className="size-4" />
            {currentValue.name || 'File'}
          </a>
          <Button
            variant="ghost"
            size="icon"
            className="size-6"
            onClick={handleRemove}
            disabled={loading || isLoading}
          >
            <IconTrash className="size-3" />
          </Button>
        </div>
      ) : (
        <Button
          variant="outline"
          size="sm"
          onClick={() => inputRef.current?.click()}
          disabled={isLoading || loading}
        >
          {isLoading ? <Spinner size="sm" /> : <IconPaperclip className="size-4" />}
          Upload file
        </Button>
      )}
    </div>
  );
};
