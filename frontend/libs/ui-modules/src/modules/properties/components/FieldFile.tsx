import { Button, Spinner, useUpload } from 'erxes-ui';
import { REACT_APP_API_URL } from 'erxes-ui/utils';
import { IconPaperclip, IconTrash } from '@tabler/icons-react';
import { useRef, useState } from 'react';
import { SpecificFieldProps } from './Field';

export const FieldFile = (props: SpecificFieldProps) => {
  const { value, handleChange, loading } = props;
  const [currentValue, setCurrentValue] = useState(value || null);
  const { upload, remove, isLoading } = useUpload();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    upload({
      files,
      afterUpload: ({ status, response, fileInfo }) => {
        if (status === 'ok') {
          const newValue = { url: response, name: fileInfo.name, type: fileInfo.type, size: fileInfo.size };
          setCurrentValue(newValue);
          handleChange(newValue);
        }
      },
    });
  };

  const handleRemove = () => {
    if (currentValue?.url) {
      remove({
        fileName: currentValue.url,
        afterRemove: () => {},
      });
    }
    setCurrentValue(null);
    handleChange(null);
    if (inputRef.current) inputRef.current.value = '';
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
            disabled={loading}
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
