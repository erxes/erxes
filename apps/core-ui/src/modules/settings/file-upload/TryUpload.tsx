import { IconCloudUpload, IconFile } from '@tabler/icons-react';
import { useMutation } from '@tanstack/react-query';
import { Button } from 'erxes-ui';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { uploadErrorMessage, uploadFile } from '~/lib/files';

const formatSize = (bytes: number) =>
  bytes < 1024
    ? `${bytes} B`
    : bytes < 1024 * 1024
      ? `${(bytes / 1024).toFixed(1)} KB`
      : `${(bytes / 1024 / 1024).toFixed(1)} MB`;

/** Uploads one file with the current settings, to check them. */
export const TryUpload = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'file-upload' });
  const input = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState(0);

  const send = useMutation({
    mutationFn: (file: File) => {
      setProgress(0);

      return uploadFile(file, { onProgress: setProgress });
    },
  });
  const result = send.data;

  return (
    <section className="space-y-3 rounded-lg border bg-background p-5">
      <div>
        <h2 className="text-base font-semibold">{t('try', 'Try an upload')}</h2>
        <p className="text-sm text-muted-foreground">
          {t('try-description', 'Check the settings with a real file.')}
        </p>
      </div>
      <input
        ref={input}
        type="file"
        className="hidden"
        aria-label={t('choose-file', 'Choose a file')}
        onChange={(event) => {
          const file = event.target.files?.[0];

          if (file) send.mutate(file);
          event.target.value = '';
        }}
      />
      <Button variant="outline" disabled={send.isPending} onClick={() => input.current?.click()}>
        {send.isPending ? `${progress}%` : <IconCloudUpload />}
        {send.isPending ? t('uploading', 'Uploading…') : t('choose-file', 'Choose a file')}
      </Button>
      {send.error && <p className="text-sm text-destructive">{uploadErrorMessage(send.error)}</p>}
      {result && (
        <a
          href={result.url}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-accent"
        >
          <IconFile className="size-4 text-muted-foreground" />
          <span className="flex-1 truncate font-medium">{result.name}</span>
          <span className="text-xs text-muted-foreground">{formatSize(result.size)}</span>
        </a>
      )}
    </section>
  );
};
