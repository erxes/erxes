import { zodResolver } from '@hookform/resolvers/zod';
import {
  IconBrandFacebook,
  IconExternalLink,
  IconPlus,
} from '@tabler/icons-react';
import {
  Button,
  Combobox,
  Command,
  Empty,
  Form,
  Input,
  Popover,
  Select,
  Sheet,
  Sidebar,
  Spinner,
  Textarea,
  useToast,
} from 'erxes-ui';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import {
  FACEBOOK_POST_DEFAULT_VALUES,
  FACEBOOK_POST_SCHEMA,
  TFacebookPostForm,
} from '../constants/FbPostSchema';
import { useFacebookCreatePost } from '../hooks/useFacebookCreatePost';
import { useFacebookPostImages } from '../hooks/useFacebookPostImages';
import { useFacebookPostTargets } from '../hooks/useFacebookPostTargets';
import { FacebookPostImagesField } from './FacebookPostImagesField';

export const FacebookPostSheet = () => {
  const { t } = useTranslation('frontline');

  return (
    <Sheet>
      <Sheet.Trigger asChild>
        <Sidebar.MenuAction
          showOnHover
          className="text-muted-foreground hover:text-foreground"
          aria-label={t('create-facebook-post')}
          onClick={(e) => e.stopPropagation()}
        >
          <IconPlus />
        </Sidebar.MenuAction>
      </Sheet.Trigger>
      <Sheet.View className="p-0">
        <FacebookPostForm />
      </Sheet.View>
    </Sheet>
  );
};

const FacebookPostForm = () => {
  const { t } = useTranslation('frontline');
  const { toast } = useToast();
  const { createPost, loading: posting } = useFacebookCreatePost();
  const [permalinkUrl, setPermalinkUrl] = useState<string | null>(null);
  const [integrationOpen, setIntegrationOpen] = useState(false);

  const form = useForm<TFacebookPostForm>({
    resolver: zodResolver(FACEBOOK_POST_SCHEMA),
    defaultValues: FACEBOOK_POST_DEFAULT_VALUES,
  });

  const images = useFacebookPostImages();

  const { postIntegrations, pages, loadingIntegrations, loadingPages } =
    useFacebookPostTargets(form);

  const onSubmit = (data: TFacebookPostForm) => {
    if (images.isUploading) {
      toast({
        title: t('post-images-still-uploading'),
        variant: 'destructive',
      });
      return;
    }

    const { keys } = images;

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

        images.clear();
        form.reset({
          ...FACEBOOK_POST_DEFAULT_VALUES,
          integrationId: data.integrationId,
          pageId: data.pageId,
        });
      },
      onError: (error: Error) =>
        toast({ title: error.message, variant: 'destructive' }),
    });
  };

  const hasIntegrations = postIntegrations.length > 0;

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
          {loadingIntegrations && <Spinner />}

          {!loadingIntegrations && !hasIntegrations && (
            <Empty>
              <Empty.Header>
                <Empty.Media variant="icon">
                  <IconBrandFacebook />
                </Empty.Media>
                <Empty.Title>{t('no-connected-pages')}</Empty.Title>
              </Empty.Header>
            </Empty>
          )}

          {!loadingIntegrations && hasIntegrations && (
            <>
              <Form.Field
                control={form.control}
                name="integrationId"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>{t('integration')}</Form.Label>
                    <Popover
                      open={integrationOpen}
                      onOpenChange={setIntegrationOpen}
                    >
                      <Form.Control>
                        <Combobox.Trigger className="w-full">
                          <Combobox.Value
                            placeholder={t('select-integration')}
                            value={
                              postIntegrations.find(
                                (integration) =>
                                  integration._id === field.value,
                              )?.name
                            }
                          />
                        </Combobox.Trigger>
                      </Form.Control>
                      <Combobox.Content>
                        <Command>
                          <Command.Input
                            variant="secondary"
                            focusOnMount
                            placeholder={t('search-integrations')}
                          />
                          <Command.List className="max-h-[300px] overflow-y-auto">
                            <Combobox.Empty />
                            {postIntegrations.map((integration) => (
                              <Command.Item
                                key={integration._id}
                                value={integration.name}
                                onSelect={() => {
                                  field.onChange(integration._id);
                                  form.setValue('pageId', '');
                                  setIntegrationOpen(false);
                                }}
                              >
                                {integration.name}
                                <Combobox.Check
                                  checked={field.value === integration._id}
                                />
                              </Command.Item>
                            ))}
                          </Command.List>
                        </Command>
                      </Combobox.Content>
                    </Popover>
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
                    {!loadingPages && pages.length === 0 && (
                      <Form.Description>
                        {t('no-connected-pages')}
                      </Form.Description>
                    )}
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

              <FacebookPostImagesField images={images} />

              {permalinkUrl && (
                <Button variant="outline" className="self-start" asChild>
                  <a href={permalinkUrl} target="_blank" rel="noreferrer">
                    <IconExternalLink />
                    {t('view-on-facebook')}
                  </a>
                </Button>
              )}
            </>
          )}
        </Sheet.Content>

        <Sheet.Footer>
          <Sheet.Close asChild>
            <Button variant="ghost">{t('cancel')}</Button>
          </Sheet.Close>
          <Button
            type="submit"
            disabled={
              posting ||
              !hasIntegrations ||
              pages.length === 0 ||
              images.isUploading
            }
          >
            {posting ? <Spinner /> : t('publish')}
          </Button>
        </Sheet.Footer>
      </form>
    </Form>
  );
};
