import { DataExtensionFile } from '@erxes/core-contract/dataExtensionValues';
import { IconPaperclip, IconX } from '@tabler/icons-react';
import { Button, Spinner, useToast } from 'erxes-ui';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { fileDownloadUrl, uploadErrorMessage, uploadFile } from '~/lib/files';
import type { ValueInputProps } from './inputProps';

const Files = z.array(DataExtensionFile);

type StoredFile = z.infer<typeof DataExtensionFile>;

/** Uploads picked files to core's file service, then adds them to `files`. */
const useAttach = (files: StoredFile[], onChange: ValueInputProps['onChange']) => {
  const { t } = useTranslation('data', { keyPrefix: 'form' });
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);

  const attach = async (picked: File[]) => {
    setUploading(true);

    try {
      const added = await Promise.all(picked.map((file) => uploadFile(file)));

      onChange([
        ...files,
        ...added.map((file) => ({
          id: file.id,
          name: file.name,
          type: file.contentType,
          size: file.size,
        })),
      ]);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: t('upload-failed', 'Could not upload the file'),
        description: uploadErrorMessage(error),
      });
    } finally {
      setUploading(false);
    }
  };

  return { attach, uploading };
};

const FileLine = ({ file, onRemove }: { file: StoredFile; onRemove?: () => void }) => {
  const { t } = useTranslation('data', { keyPrefix: 'form' });

  return (
    <div className="flex items-center gap-2 text-sm">
      <IconPaperclip className="size-4 text-muted-foreground" />
      <a
        href={fileDownloadUrl(file.id)}
        className="min-w-0 truncate text-primary-text hover:underline"
        target="_blank"
        rel="noreferrer"
      >
        {file.name}
      </a>
      {onRemove && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={t('remove-file', 'Remove {{name}}', { name: file.name })}
          onClick={onRemove}
        >
          <IconX />
        </Button>
      )}
    </div>
  );
};

/** Files of core's file service: each a link, removable; Attach uploads more. */
export const FilesValueInput = ({ value, onChange, id, disabled }: ValueInputProps) => {
  const { t } = useTranslation('data', { keyPrefix: 'form' });
  const input = useRef<HTMLInputElement>(null);
  const files = Files.safeParse(value).data ?? [];
  const { attach, uploading } = useAttach(files, onChange);

  const remove = (fileId: string) => {
    const next = files.filter((file) => file.id !== fileId);

    onChange(next.length ? next : null);
  };

  return (
    <div className="flex flex-col gap-1.5">
      {files.map((file) => (
        <FileLine
          key={file.id}
          file={file}
          onRemove={disabled ? undefined : () => remove(file.id)}
        />
      ))}
      <input
        ref={input}
        id={id}
        type="file"
        aria-label={t('attach', 'Attach files')}
        multiple
        className="sr-only"
        disabled={Boolean(disabled) || uploading}
        onChange={(event) => {
          const picked = [...(event.target.files ?? [])];

          event.target.value = '';

          if (picked.length) void attach(picked);
        }}
      />
      {!disabled && (
        <Button
          type="button"
          variant="outline"
          className="self-start"
          disabled={uploading}
          onClick={() => input.current?.click()}
        >
          {uploading ? <Spinner size="sm" /> : <IconPaperclip />}
          {t('attach', 'Attach files')}
        </Button>
      )}
    </div>
  );
};
