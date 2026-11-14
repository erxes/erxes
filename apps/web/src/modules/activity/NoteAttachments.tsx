import type { FileInfo } from '@erxes/core-contract';
import { IconPaperclip, IconX } from '@tabler/icons-react';
import { Button, Spinner, useToast } from 'erxes-ui';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { uploadErrorMessage, uploadFile } from '~/lib/files';

/** Files attached to the draft, uploaded as they are picked. */
export const useAttachments = () => {
  const { toast } = useToast();
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [uploading, setUploading] = useState(0);

  const attach = async (list: File[]) => {
    for (const file of list) {
      setUploading((count) => count + 1);

      try {
        const uploaded = await uploadFile(file);

        setFiles((current) => [...current, uploaded]);
      } catch (error) {
        toast({ variant: 'destructive', title: file.name, description: uploadErrorMessage(error) });
      } finally {
        setUploading((count) => count - 1);
      }
    }
  };

  return {
    files,
    uploading,
    attach,
    remove: (id: string) => setFiles((current) => current.filter((item) => item.id !== id)),
    reset: () => setFiles([]),
  };
};

export const AttachedFiles = ({
  files,
  uploading,
  onRemove,
}: {
  files: FileInfo[];
  uploading: number;
  onRemove: (id: string) => void;
}) => {
  const { t } = useTranslation('common', { keyPrefix: 'activity' });

  return (
    <div className="flex flex-wrap gap-1.5 px-3 pb-2">
      {files.map((file) => (
        <span
          key={file.id}
          className="flex h-6 items-center gap-1 rounded-md bg-muted px-2 text-xs text-muted-foreground"
        >
          <IconPaperclip className="size-3" />
          <span className="max-w-40 truncate">{file.name}</span>
          <button
            type="button"
            aria-label={t('remove-file', 'Remove')}
            onClick={() => onRemove(file.id)}
          >
            <IconX className="size-3" />
          </button>
        </span>
      ))}
      {uploading > 0 && <Spinner size="sm" />}
    </div>
  );
};

/** The paperclip: picks files and attaches them; the picker is cleared for the next pick. */
export const AttachButton = ({ onAttach }: { onAttach: (files: File[]) => Promise<void> }) => {
  const { t } = useTranslation('common', { keyPrefix: 'activity' });
  const fileInput = useRef<HTMLInputElement>(null);

  return (
    <>
      <input
        ref={fileInput}
        type="file"
        multiple
        className="hidden"
        aria-label={t('attach', 'Attach files')}
        onChange={(event) => {
          const input = event.target;

          void onAttach(Array.from(input.files ?? [])).finally(() => {
            input.value = '';
          });
        }}
      />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="size-7"
        aria-label={t('attach', 'Attach files')}
        onClick={() => fileInput.current?.click()}
      >
        <IconPaperclip className="size-4" />
      </Button>
    </>
  );
};
