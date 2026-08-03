import { useIntegrationDetail } from '@/integrations/hooks/useIntegrationDetail';
import { useIntegrations } from '@/integrations/hooks/useIntegrations';
import { IntegrationType } from '@/types/Integration';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  IconExternalLink,
  IconPhotoPlus,
  IconPlus,
  IconX,
} from '@tabler/icons-react';
import {
  Button,
  cn,
  Form,
  Input,
  Label,
  Select,
  Sheet,
  Spinner,
  Textarea,
  useErxesUpload,
  useRemoveFile,
  useToast,
} from 'erxes-ui';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm, type UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { FACEBOOK_POST_SCHEMA } from '../constants/FbPostSchema';
import { useFacebookCreatePost } from '../hooks/useFacebookCreatePost';

type TForm = z.infer<typeof FACEBOOK_POST_SCHEMA>;

const MAX_IMAGES = 10;
const MAX_IMAGE_BYTES = 4 * 1024 * 1024;

const ACCEPTED_IMAGE_TYPES = [
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/gif',
];

const DEFAULTS: TForm = {
  integrationId: '',
  pageId: '',
  message: '',
  link: '',
};

export const FacebookPostSheet = () => {
  const { t } = useTranslation('frontline');
  const [open, setOpen] = useState(false);

  const [permalinkUrl, setPermalinkUrl] = useState<string | null>(null);
  const [images, setImages] = useState<{ name: string; key: string }[]>([]);

  const form = useForm<TForm>({
    resolver: zodResolver(FACEBOOK_POST_SCHEMA),
    defaultValues: DEFAULTS,
  });

  const onFilesAdded = useCallback(
    (added: { name: string; url: string }[]) =>
      setImages((prev) =>
        [...prev, ...added.map((f) => ({ name: f.name, key: f.url }))].slice(
          0,
          MAX_IMAGES,
        ),
      ),
    [],
  );

  const upload = useErxesUpload({
    allowedMimeTypes: ACCEPTED_IMAGE_TYPES,
    maxFileSize: MAX_IMAGE_BYTES,
    maxFiles: MAX_IMAGES,
    onFilesAdded,
  });

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <Sheet.Trigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label={t('create-facebook-post')}
          onClick={(e) => e.stopPropagation()}
        >
          <IconPlus />
        </Button>
      </Sheet.Trigger>
      <Sheet.View className="p-0">
        <FacebookPostSheetForm
          setOpen={setOpen}
          form={form}
          images={images}
          setImages={setImages}
          upload={upload}
          permalinkUrl={permalinkUrl}
          setPermalinkUrl={setPermalinkUrl}
        />
      </Sheet.View>
    </Sheet>
  );
};

const FacebookPostSheetForm = ({
  setOpen,
  form,
  images,
  setImages,
  upload,
  permalinkUrl,
  setPermalinkUrl,
}: {
  setOpen: (open: boolean) => void;
  form: UseFormReturn<TForm>;
  images: { name: string; key: string }[];
  setImages: React.Dispatch<
    React.SetStateAction<{ name: string; key: string }[]>
  >;
  upload: ReturnType<typeof useErxesUpload>;
  permalinkUrl: string | null;
  setPermalinkUrl: (url: string | null) => void;
}) => {
  const { t } = useTranslation('frontline');
  const { toast } = useToast();
  const { createPost, loading: posting } = useFacebookCreatePost();
  const { removeFile } = useRemoveFile();

  const failedNames = new Set(upload.errors.map((e) => e.name));
  const pendingFiles = upload.files.filter((f) => !failedNames.has(f.name));

  const dismissError = (name: string) => {
    upload.setFiles((prev) => prev.filter((f) => f.name !== name));
    upload.setErrors((prev) => prev.filter((e) => e.name !== name));
  };

  const discardImage = (index: number) => {
    const image = images[index];
    setImages((prev) => prev.filter((_, i) => i !== index));
    if (image) {
      removeFile(image.key, () => undefined).catch(() => undefined);
    }
  };

  useEffect(() => {
    if (upload.files.length > 0 && !upload.loading) {
      upload.onUpload().catch(() =>
        toast({
          title: t('post-images-upload-failed'),
          variant: 'destructive',
        }),
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [upload.files.length]);

  const integrationId = form.watch('integrationId');

  const { integrations, loading: loadingIntegrations } = useIntegrations({
    variables: {
      kind: IntegrationType.FACEBOOK_POST,
      channelId: '',
      limit: 100,
    },
  });

  const postIntegrations = useMemo(
    () => (integrations || []).filter((i) => i.isActive !== false),
    [integrations],
  );

  const { integrationDetail, loading: loadingPages } = useIntegrationDetail({
    integrationId: integrationId || null,
  });

  const pages = integrationDetail?.facebookPage || [];

  useEffect(() => {
    if (postIntegrations.length && !form.getValues('integrationId')) {
      form.setValue('integrationId', postIntegrations[0]._id);
    }
  }, [postIntegrations, form]);

  useEffect(() => {
    const current = form.getValues('pageId');
    if (pages.length && !pages.some((p) => p.pageId === current)) {
      form.setValue('pageId', pages[0].pageId);
    }
  }, [pages, form]);

  const onSubmit = (data: TForm) => {
    if (upload.loading || pendingFiles.length > 0) {
      toast({
        title: t('post-images-still-uploading'),
        variant: 'destructive',
      });
      return;
    }

    const keys = images.map((i) => i.key);

    if (keys.length && data.link) {
      toast({
        title: t('post-images-or-link'),
        variant: 'destructive',
      });
      return;
    }

    createPost({
      variables: {
        erxesApiId: data.integrationId,
        pageId: data.pageId,
        message: data.message,
        link: data.link || undefined,
        imageKeys: keys.length ? keys : undefined,
      },
      onCompleted: (response) => {
        setPermalinkUrl(response?.facebookCreatePost?.permalinkUrl || null);
        toast({ variant: 'success', title: t('post-published') });

        keys.forEach((key) =>
          removeFile(key, (status) => {
            if (status !== 'ok') {
              // eslint-disable-next-line no-console
              console.warn('[facebook-post] image cleanup failed', key, status);
            }
          }).catch((e) =>
            // eslint-disable-next-line no-console
            console.warn('[facebook-post] image cleanup threw', key, e),
          ),
        );

        setImages([]);
        form.reset({
          ...DEFAULTS,
          integrationId: data.integrationId,
          pageId: data.pageId,
        });
      },
      onError: (error: Error) =>
        toast({ title: error.message, variant: 'destructive' }),
    });
  };

  if (loadingIntegrations) return <Spinner className="p-20" />;

  const noPages = !loadingPages && pages.length === 0;

  return (
    <Form {...form}>
      <form
        className="flex flex-col size-full gap-0"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <Sheet.Header>
          <Sheet.Title>{t('create-facebook-post')}</Sheet.Title>
          <Sheet.Close />
        </Sheet.Header>

        <Sheet.Content className="grow flex flex-col px-5 py-4 gap-4 overflow-y-auto">
          {postIntegrations.length === 0 ? (
            <Label>{t('no-connected-pages')}</Label>
          ) : (
            <>
              <Form.Field
                control={form.control}
                name="integrationId"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>{t('channel')}</Form.Label>
                    <Select
                      value={field.value}
                      onValueChange={(v) => {
                        field.onChange(v);
                        form.setValue('pageId', '');
                      }}
                    >
                      <Form.Control>
                        <Select.Trigger>
                          <Select.Value placeholder={t('channel')} />
                        </Select.Trigger>
                      </Form.Control>
                      <Select.Content>
                        {postIntegrations.map((integration) => (
                          <Select.Item
                            key={integration._id}
                            value={integration._id}
                          >
                            {integration.name}
                          </Select.Item>
                        ))}
                      </Select.Content>
                    </Select>
                    <Form.Message />
                  </Form.Item>
                )}
              />

              <Form.Field
                control={form.control}
                name="pageId"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>{t('facebook-page')}</Form.Label>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={loadingPages || pages.length === 0}
                    >
                      <Form.Control>
                        <Select.Trigger>
                          <Select.Value placeholder={t('facebook-page')} />
                        </Select.Trigger>
                      </Form.Control>
                      <Select.Content>
                        {pages.map((page) => (
                          <Select.Item key={page.pageId} value={page.pageId}>
                            {page.name}
                          </Select.Item>
                        ))}
                      </Select.Content>
                    </Select>
                    {noPages && <Label>{t('no-connected-pages')}</Label>}
                    <Form.Message />
                  </Form.Item>
                )}
              />

              <Form.Field
                control={form.control}
                name="message"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>{t('post-message')}</Form.Label>
                    <Form.Control>
                      <Textarea
                        {...field}
                        rows={6}
                        placeholder={t('post-message-placeholder')}
                      />
                    </Form.Control>
                    <Form.Message />
                  </Form.Item>
                )}
              />

              <Form.Field
                control={form.control}
                name="link"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>{t('post-link')}</Form.Label>
                    <Form.Control>
                      <Input {...field} placeholder="https://" />
                    </Form.Control>
                    <Form.Message />
                  </Form.Item>
                )}
              />

              <div className="space-y-2">
                <Label>{t('post-images')}</Label>

                <div
                  {...upload.getRootProps()}
                  className={cn(
                    'flex flex-col items-center justify-center gap-1 rounded-md border border-dashed p-6 text-sm text-muted-foreground cursor-pointer transition-colors',
                    upload.isDragActive
                      ? 'border-primary bg-accent'
                      : 'hover:border-primary/50',
                    images.length >= MAX_IMAGES &&
                      'pointer-events-none opacity-50',
                  )}
                >
                  <input {...upload.getInputProps()} />
                  <IconPhotoPlus size={20} />
                  <span>{t('post-images-drop')}</span>
                </div>

                {upload.loading && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Spinner />
                    {t('post-images-uploading')}
                  </div>
                )}

                {upload.errors.length > 0 && (
                  <ul className="flex flex-col gap-1 text-sm text-destructive">
                    {upload.errors.map((e) => (
                      <li key={e.name} className="flex items-start gap-2">
                        <span className="flex-auto break-all">
                          {e.name}:{' '}
                          {e.message || t('post-images-upload-failed')}
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="size-5 shrink-0"
                          onClick={() => dismissError(e.name)}
                        >
                          <IconX size={12} />
                        </Button>
                      </li>
                    ))}
                  </ul>
                )}

                {images.length > 0 && (
                  <ul className="flex flex-col gap-1">
                    {images.map((image, index) => (
                      <li
                        key={image.key}
                        className="flex items-center gap-2 rounded-md bg-muted px-2 py-1 text-sm"
                      >
                        <span className="truncate flex-auto">{image.name}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="size-6 shrink-0"
                          onClick={() => discardImage(index)}
                        >
                          <IconX size={14} />
                        </Button>
                      </li>
                    ))}
                  </ul>
                )}

                <p className="text-xs text-muted-foreground">
                  {t('post-images-help')}
                </p>
              </div>

              {permalinkUrl && (
                <a
                  href={permalinkUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 text-sm text-primary underline"
                >
                  <IconExternalLink size={16} />
                  {t('view-on-facebook')}
                </a>
              )}
            </>
          )}
        </Sheet.Content>

        <Sheet.Footer>
          <Button
            type="button"
            variant="ghost"
            disabled={posting}
            onClick={() => setOpen(false)}
          >
            {t('cancel')}
          </Button>
          <Button
            type="submit"
            disabled={
              posting ||
              pages.length === 0 ||
              upload.loading ||
              pendingFiles.length > 0
            }
          >
            {posting ? <Spinner /> : t('publish')}
          </Button>
        </Sheet.Footer>
      </form>
    </Form>
  );
};
