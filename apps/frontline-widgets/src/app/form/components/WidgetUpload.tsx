import { useRef, useState } from 'react';
import { Button, Spinner } from 'erxes-ui';
import { useToast } from 'erxes-ui/hooks';
import { IconUpload, IconX } from '@tabler/icons-react';
import uploadHandler from '../../../lib/uploadHandler';

type Props = {
  value: string[];
  onChange: (urls: string[]) => void;
  multiple?: boolean;
  label?: string;
};

export const WidgetUpload = ({
  value = [],
  onChange,
  multiple = false,
  label = 'Upload file',
}: Props) => {
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = event.target;
    if (!files || files.length === 0) return;

    setIsLoading(true);

    const newUrls: string[] = [];
    let completed = 0;
    const total = files.length;

    uploadHandler({
      files,
      afterUpload: ({ response }) => {
        newUrls.push(response);
        completed++;
        if (completed === total) {
          setIsLoading(false);
          onChange(multiple ? [...value, ...newUrls] : newUrls);
        }
      },
      onError: (message) => {
        setIsLoading(false);
        toast({
          title: 'Error uploading file',
          description: message || 'Failed to upload file',
          variant: 'destructive',
        });
      },
    });

    event.target.value = '';
  };

  const handleRemove = (url: string) => {
    onChange(value.filter((u) => u !== url));
  };

  return (
    <div className="flex flex-col gap-2">
      {value.length > 0 && (
        <div className="flex gap-1 flex-wrap">
          {value.map((url) => {
            const name = url.split('/').pop() || url;
            return (
              <span
                key={url}
                className="inline-flex items-center gap-1 text-xs bg-muted px-2 py-1 rounded max-w-[200px]"
              >
                <span className="truncate">{name}</span>
                <button
                  type="button"
                  onClick={() => handleRemove(url)}
                  className="shrink-0 text-muted-foreground hover:text-foreground"
                >
                  <IconX size={10} />
                </button>
              </span>
            );
          })}
        </div>
      )}
      <Button
        type="button"
        variant="outline"
        onClick={handleClick}
        disabled={isLoading}
        className="w-fit"
      >
        {isLoading ? <Spinner className="mr-1" /> : <IconUpload size={14} className="mr-1" />}
        {label}
      </Button>
      <input
        ref={fileInputRef}
        type="file"
        multiple={multiple}
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
};
