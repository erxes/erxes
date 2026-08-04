import { IconPhoto, IconTrash, IconUpload } from '@tabler/icons-react';
import { useRef } from 'react';

import { Button, Spinner, cn, useUpload } from 'erxes-ui';
import { readImage } from 'erxes-ui/utils/core';

type Props = {
  value?: string;
  onChange: (url: string) => void;
  disabled?: boolean;
};

export const OAuthClientLogoUpload = ({ value, onChange, disabled }: Props) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const { isLoading, upload } = useUpload();

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;

    if (!files || files.length === 0) {
      return;
    }

    upload({
      files,
      afterUpload: ({ status, response }) => {
        if (status === 'ok' && response) {
          onChange(response);
        }
      },
    });

    // reset so the same file can be re-selected
    e.target.value = '';
  };

  const handleRemove = () => {
    onChange('');
  };

  return (
    <div className="flex items-center gap-4">
      <div
        className={cn(
          'flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-muted',
          isLoading && 'opacity-60',
        )}
      >
        {value ? (
          <img
            src={readImage(value, 64)}
            alt="Logo"
            className="size-full object-contain"
          />
        ) : (
          <IconPhoto className="size-7 text-muted-foreground" />
        )}
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={disabled || isLoading}
            onClick={handleClick}
          >
            {isLoading ? <Spinner /> : <IconUpload className="size-4" />}
            {value ? 'Change' : 'Upload'}
          </Button>

          {value ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={disabled || isLoading}
              onClick={handleRemove}
            >
              <IconTrash className="size-4" />
              Remove
            </Button>
          ) : null}
        </div>

        <p className="text-xs text-muted-foreground">
          PNG, JPG, SVG — max 2 MB
        </p>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/svg+xml,image/webp"
        className="hidden"
        onChange={handleChange}
      />
    </div>
  );
};
