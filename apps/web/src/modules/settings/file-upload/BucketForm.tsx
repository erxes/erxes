import type { FileSettings } from '@erxes/core-contract';
import { messageOf, orpc } from '@erxes/core-contract/client';
import { zodResolver } from '@hookform/resolvers/zod';
import { IconCloudUpload, IconServer } from '@tabler/icons-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button, Checkbox, Form, Input, Spinner, useToast } from 'erxes-ui';
import type { TFunction } from 'i18next';
import { useId } from 'react';
import { type Control, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { fileSettingsQuery } from './LimitsForm';

type Translate = TFunction<'settings', 'file-upload'>;

type Bucket = NonNullable<FileSettings['bucket']>;

/** What the API takes (FileBucketInput); the secret may stay empty for the same bucket and key. */
const bucketSchema = (t: Translate, saved: Bucket | null) =>
  z
    .object({
      endpoint: z
        .string()
        .trim()
        .regex(
          /^https?:\/\/\S+$/,
          t('bucket.endpoint-invalid', 'Enter an address starting with https://'),
        ),
      region: z
        .string()
        .trim()
        .regex(
          /^[a-z0-9-]{1,64}$/,
          t('bucket.region-invalid', 'Enter a region, such as auto or us-east-1'),
        ),
      bucket: z
        .string()
        .trim()
        .regex(
          /^[a-z0-9][a-z0-9.-]{1,61}[a-z0-9]$/,
          t('bucket.name-invalid', '3 to 63 lowercase letters, digits, dots or hyphens'),
        ),
      accessKeyId: z
        .string()
        .trim()
        .min(1, t('bucket.key-required', 'Enter the access key ID'))
        .max(128),
      secretAccessKey: z.string().max(256),
      forcePathStyle: z.boolean(),
    })
    .refine(
      (values) =>
        values.secretAccessKey ||
        (saved?.endpoint === values.endpoint &&
          saved.bucket === values.bucket &&
          saved.accessKeyId === values.accessKeyId),
      {
        path: ['secretAccessKey'],
        message: t('bucket.secret-required', 'Enter the secret access key'),
      },
    );

type BucketValues = z.infer<ReturnType<typeof bucketSchema>>;

type TextName = Exclude<keyof BucketValues, 'forcePathStyle'>;

const valuesOf = (saved: Bucket | null): BucketValues => ({
  endpoint: saved?.endpoint ?? '',
  region: saved?.region ?? 'auto',
  bucket: saved?.bucket ?? '',
  accessKeyId: saved?.accessKeyId ?? '',
  secretAccessKey: '',
  forcePathStyle: saved?.forcePathStyle ?? false,
});

const useBucketChanges = (onSaved: (settings: FileSettings) => void) => {
  const { t } = useTranslation('settings', { keyPrefix: 'file-upload' });
  const client = useQueryClient();
  const { toast } = useToast();

  const handlers = (title: string) => ({
    onSuccess: (next: FileSettings) => {
      client.setQueryData(fileSettingsQuery().queryKey, next);
      onSaved(next);
      toast({ title });
    },
    onError: (error: Error) =>
      toast({
        variant: 'destructive',
        title: t('save-failed', 'Could not save'),
        description: messageOf(error),
      }),
  });

  return {
    save: useMutation(
      orpc.files.saveBucket.mutationOptions(
        handlers(t('bucket.saved', 'New uploads go to the bucket')),
      ),
    ),
    remove: useMutation(
      orpc.files.removeBucket.mutationOptions(
        handlers(t('bucket.removed', 'New uploads stay on this server')),
      ),
    ),
  };
};

const TextField = ({
  control,
  name,
  label,
  placeholder,
  password,
  disabled,
}: {
  control: Control<BucketValues>;
  name: TextName;
  label: string;
  placeholder?: string;
  password?: boolean;
  disabled: boolean;
}) => (
  <Form.Field
    control={control}
    name={name}
    render={({ field }) => (
      <Form.Item>
        <Form.Label required={!password}>{label}</Form.Label>
        <Form.Control>
          <Input
            {...field}
            type={password ? 'password' : 'text'}
            autoComplete={password ? 'new-password' : 'off'}
            placeholder={placeholder}
            disabled={disabled}
          />
        </Form.Control>
        <Form.Message />
      </Form.Item>
    )}
  />
);

/** Where new uploads go now. */
const CurrentStorage = ({ saved }: { saved: Bucket | null }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'file-upload' });
  const Icon = saved ? IconCloudUpload : IconServer;

  return (
    <p className="flex items-center gap-2 rounded-md border bg-muted px-3 py-2 text-sm">
      <Icon className="size-4 shrink-0 text-muted-foreground" />
      {saved
        ? t('bucket.current', {
            bucket: saved.bucket,
            defaultValue: `New uploads go to the bucket ${saved.bucket}.`,
          })
        : t('bucket.current-local', 'New uploads are kept on this server’s disk.')}
    </p>
  );
};

const BucketFields = ({
  control,
  disabled,
}: {
  control: Control<BucketValues>;
  disabled: boolean;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'file-upload' });
  const id = useId();

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <TextField
          control={control}
          name="endpoint"
          label={t('bucket.endpoint', 'S3 API address')}
          placeholder="https://<account>.r2.cloudflarestorage.com"
          disabled={disabled}
        />
      </div>
      <TextField
        control={control}
        name="bucket"
        label={t('bucket.name', 'Bucket')}
        placeholder="erxes-files"
        disabled={disabled}
      />
      <TextField
        control={control}
        name="region"
        label={t('bucket.region', 'Region')}
        placeholder="auto"
        disabled={disabled}
      />
      <TextField
        control={control}
        name="accessKeyId"
        label={t('bucket.key', 'Access key ID')}
        disabled={disabled}
      />
      <TextField
        control={control}
        name="secretAccessKey"
        label={t('bucket.secret', 'Secret access key')}
        password
        disabled={disabled}
      />
      <Form.Field
        control={control}
        name="forcePathStyle"
        render={({ field }) => (
          <span className="flex items-center gap-2 text-sm sm:col-span-2">
            <Checkbox
              id={`${id}-path-style`}
              checked={field.value}
              onCheckedChange={field.onChange}
              disabled={disabled}
            />
            <label htmlFor={`${id}-path-style`}>
              {t('bucket.path-style', 'Path-style addresses (MinIO and most self-hosted stores)')}
            </label>
          </span>
        )}
      />
    </div>
  );
};

/**
 * Settings › File upload on a self-hosted server that keeps files on its disk:
 * the organisation's own S3-compatible bucket. Saving writes a test file first.
 */
export const BucketForm = ({ settings, canEdit }: { settings: FileSettings; canEdit: boolean }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'file-upload' });
  const saved = settings.bucket;

  const form = useForm<BucketValues>({
    resolver: zodResolver(bucketSchema(t, saved)),
    defaultValues: valuesOf(saved),
  });

  const { save, remove } = useBucketChanges((next) => form.reset(valuesOf(next.bucket)));
  const busy = save.isPending || remove.isPending;

  const submit = form.handleSubmit(({ secretAccessKey, ...values }) =>
    save.mutate({ ...values, secretAccessKey: secretAccessKey || undefined }),
  );

  return (
    <Form {...form}>
      <form noValidate onSubmit={(event) => void submit(event)}>
        <Form.Section
          title={t('bucket.title', 'Storage')}
          description={t(
            'bucket.description',
            'Keep new uploads in your own S3-compatible bucket: AWS S3, Cloudflare R2 or MinIO. Files stored before stay where they are.',
          )}
        >
          <CurrentStorage saved={saved} />
          <BucketFields control={form.control} disabled={!canEdit || busy} />
          <div className="space-y-1 text-xs text-muted-foreground">
            <p>
              {t('bucket.cors', {
                origin: window.location.origin,
                defaultValue: `Browsers upload straight to the bucket, so its CORS rules must allow PUT from ${window.location.origin}.`,
              })}
            </p>
            {saved && (
              <p>{t('bucket.secret-kept', 'Leave the secret empty to keep the saved one.')}</p>
            )}
          </div>
          {canEdit && (
            <div className="flex flex-wrap justify-end gap-2">
              {saved && (
                <Button
                  type="button"
                  variant="ghost"
                  disabled={busy}
                  onClick={() => remove.mutate({})}
                >
                  {remove.isPending && <Spinner size="sm" />}
                  {t('bucket.remove', 'Keep new uploads on this server')}
                </Button>
              )}
              <Button type="submit" disabled={busy}>
                {save.isPending && <Spinner size="sm" />}
                {t('bucket.save', 'Test and save')}
              </Button>
            </div>
          )}
        </Form.Section>
      </form>
    </Form>
  );
};
