import type { FileInfo, FileSettings } from '@erxes/core-contract';
import { IconCloudUpload, IconDeviceFloppy, IconFile, IconServer } from '@tabler/icons-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Button,
  Input,
  Label,
  MultipleSelector,
  type MultiSelectOption,
  PageContainer,
  ScrollArea,
  Spinner,
  useToast,
} from 'erxes-ui';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PageHeader } from 'erxes-ui';
import { AppBreadcrumb } from '~/components/AppBreadcrumb';
import { api, messageOf } from '~/lib/api';
import { uploadErrorMessage, uploadFile } from '~/lib/files';
import { useCan, useSession } from '~/modules/auth/session';

const SETTINGS_KEY = ['settings', 'files'];

/** Common choices; any MIME type, `type/*` or `.ext` can be typed in. */
const TYPE_OPTIONS: MultiSelectOption[] = [
  { value: 'image/*', label: 'Images (image/*)' },
  { value: 'video/*', label: 'Videos (video/*)' },
  { value: 'audio/*', label: 'Audio (audio/*)' },
  { value: 'application/pdf', label: 'PDF' },
  { value: 'text/plain', label: 'Text' },
  { value: 'text/csv', label: 'CSV' },
  { value: '.doc', label: 'Word (.doc)' },
  { value: '.docx', label: 'Word (.docx)' },
  { value: '.xls', label: 'Excel (.xls)' },
  { value: '.xlsx', label: 'Excel (.xlsx)' },
  { value: '.ppt', label: 'PowerPoint (.ppt)' },
  { value: '.pptx', label: 'PowerPoint (.pptx)' },
  { value: '.zip', label: 'ZIP archive' },
];

const optionOf = (value: string): MultiSelectOption =>
  TYPE_OPTIONS.find((option) => option.value === value) ?? { value, label: value };

const VALID_TYPE = /^(\.[a-z0-9]{1,15}|[a-z0-9][a-z0-9.+-]*\/(\*|[a-z0-9][a-z0-9.+-]*))$/;

const formatSize = (bytes: number) =>
  bytes < 1024
    ? `${bytes} B`
    : bytes < 1024 * 1024
      ? `${(bytes / 1024).toFixed(1)} KB`
      : `${(bytes / 1024 / 1024).toFixed(1)} MB`;

const useFileSettings = () =>
  useQuery({ queryKey: SETTINGS_KEY, queryFn: () => api.files.settings(), staleTime: 60_000 });

/** Upload limits: largest file and which types are accepted. */
const LimitsForm = ({ settings, canEdit }: { settings: FileSettings; canEdit: boolean }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'file-upload' });
  const client = useQueryClient();
  const { toast } = useToast();
  const [maxSizeMb, setMaxSizeMb] = useState(String(settings.maxSizeMb));
  const [types, setTypes] = useState<MultiSelectOption[]>(settings.allowedTypes.map(optionOf));

  useEffect(() => {
    setMaxSizeMb(String(settings.maxSizeMb));
    setTypes(settings.allowedTypes.map(optionOf));
  }, [settings]);

  const save = useMutation({
    mutationFn: () =>
      api.files.updateSettings({
        maxSizeMb: Number(maxSizeMb),
        allowedTypes: types.map((option) => option.value.trim().toLowerCase()),
      }),
    onSuccess: (next) => {
      client.setQueryData(SETTINGS_KEY, next);
      toast({ title: t('saved', 'Upload settings saved') });
    },
    onError: (error) =>
      toast({
        variant: 'destructive',
        title: t('save-failed', 'Could not save'),
        description: messageOf(error),
      }),
  });

  const size = Number(maxSizeMb);

  const sizeError =
    !Number.isInteger(size) || size < 1
      ? t('size-invalid', 'Enter a whole number of MB')
      : size > settings.limitMb
        ? t('size-over-limit', {
            limit: settings.limitMb,
            defaultValue: `This server accepts up to ${settings.limitMb} MB`,
          })
        : null;

  const badType = types.find((option) => !VALID_TYPE.test(option.value.trim().toLowerCase()));

  return (
    <section className="space-y-5 rounded-lg border bg-background p-5">
      <div>
        <h2 className="text-base font-semibold">{t('limits', 'Upload limits')}</h2>
        <p className="text-sm text-muted-foreground">
          {t(
            'limits-description',
            'Apply to every upload in this organisation: team members, plugins and forms.',
          )}
        </p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="max-size">{t('max-size', 'Largest file (MB)')}</Label>
        <Input
          id="max-size"
          type="number"
          min={1}
          max={settings.limitMb}
          className="w-40"
          value={maxSizeMb}
          disabled={!canEdit}
          onChange={(event) => setMaxSizeMb(event.target.value)}
        />
        <p className={sizeError ? 'text-sm text-destructive' : 'text-xs text-muted-foreground'}>
          {sizeError ??
            t('server-limit', {
              limit: settings.limitMb,
              defaultValue: `This server allows up to ${settings.limitMb} MB.`,
            })}
        </p>
      </div>
      <div className="space-y-2">
        <Label>{t('allowed-types', 'Allowed file types')}</Label>
        <MultipleSelector
          value={types}
          onChange={setTypes}
          defaultOptions={TYPE_OPTIONS}
          creatable
          disabled={!canEdit}
          placeholder={t(
            'allowed-types-placeholder',
            'Any type: choose or type image/*, application/pdf, .docx …',
          )}
          hidePlaceholderWhenSelected
          emptyIndicator={
            <p className="py-2 text-center text-sm text-muted-foreground">
              {t('type-hint', 'Type a MIME type or .ext')}
            </p>
          }
        />
        <p className={badType ? 'text-sm text-destructive' : 'text-xs text-muted-foreground'}>
          {badType
            ? t('type-invalid', {
                value: badType.value,
                defaultValue: `"${badType.value}" is not a MIME type, type/* or .ext`,
              })
            : t(
                'types-help',
                'Leave empty to accept any type. Programs (.exe, .bat, .msi …) are never accepted.',
              )}
        </p>
      </div>
      {canEdit && (
        <Button
          disabled={Boolean(sizeError) || Boolean(badType) || save.isPending}
          onClick={() => save.mutate()}
        >
          {save.isPending ? <Spinner size="sm" /> : <IconDeviceFloppy />}
          {t('save', 'Save')}
        </Button>
      )}
    </section>
  );
};

/** Where files go; set by whoever runs the server (FILES_STORAGE). */
const StorageInfo = ({ settings }: { settings: FileSettings }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'file-upload' });

  return (
    <section className="flex gap-4 rounded-lg border bg-background p-5">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-md border bg-muted text-muted-foreground">
        {settings.storage === 's3' ? (
          <IconCloudUpload className="size-4" />
        ) : (
          <IconServer className="size-4" />
        )}
      </span>
      <div className="space-y-1">
        <h2 className="text-base font-semibold">
          {settings.storage === 's3'
            ? t('storage-s3', 'S3-compatible storage')
            : t('storage-local', 'This server’s disk')}
        </h2>
        <p className="text-sm text-muted-foreground">
          {settings.storage === 's3'
            ? t(
                'storage-s3-description',
                'Files go straight from the browser to the bucket (AWS S3, Cloudflare R2, MinIO …). erxes only keeps their details.',
              )
            : t(
                'storage-local-description',
                'Files are kept on the erxes server. For many or large files, ask your administrator to use cloud storage.',
              )}
        </p>
        <p className="text-xs text-muted-foreground">
          {t(
            'storage-config',
            'Storage and its keys are set in the server configuration, not here, so secrets never reach the browser.',
          )}
        </p>
      </div>
    </section>
  );
};

/** Uploads one file with the current settings, to check them. */
const TryUpload = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'file-upload' });
  const input = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [result, setResult] = useState<FileInfo | null>(null);
  const [error, setError] = useState<string | null>(null);

  const send = async (file: File) => {
    setResult(null);
    setError(null);
    setProgress(0);

    try {
      setResult(await uploadFile(file, { onProgress: setProgress }));
    } catch (failure) {
      setError(uploadErrorMessage(failure));
    } finally {
      setProgress(null);
    }
  };

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
        onChange={(event) => {
          const file = event.target.files?.[0];

          if (file) void send(file);
          event.target.value = '';
        }}
      />
      <Button variant="outline" disabled={progress !== null} onClick={() => input.current?.click()}>
        {progress !== null ? `${progress}%` : <IconCloudUpload />}
        {progress !== null ? t('uploading', 'Uploading…') : t('choose-file', 'Choose a file')}
      </Button>
      {error && <p className="text-sm text-destructive">{error}</p>}
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

/** Settings › File upload. */
export const FileUploadSettingsPage = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'file-upload' });
  const { user } = useSession();
  const { data: settings, isPending } = useFileSettings();
  const canEdit = useCan()('settings.manage');

  return (
    <PageContainer>
      <PageHeader>
        <PageHeader.Start>
          <AppBreadcrumb
            items={[
              {
                label: t('title', 'File upload'),
                to: '/settings/file-upload',
                icon: IconCloudUpload,
              },
            ]}
          />
        </PageHeader.Start>
      </PageHeader>
      <ScrollArea className="flex-1">
        <div className="mx-auto flex w-full max-w-2xl flex-col gap-4 p-6">
          {isPending || !settings ? (
            <Spinner containerClassName="py-12" />
          ) : (
            <>
              {!canEdit && (
                <p className="rounded-md border bg-muted px-3 py-2 text-sm text-muted-foreground">
                  {t('read-only', 'Only owners and admins can change these settings.')}
                </p>
              )}
              <LimitsForm settings={settings} canEdit={canEdit} />
              <StorageInfo settings={settings} />
              <TryUpload />
            </>
          )}
        </div>
      </ScrollArea>
    </PageContainer>
  );
};
