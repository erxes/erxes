import { useIntegrationDetail } from '@/integrations/hooks/useIntegrationDetail';
import { zodResolver } from '@hookform/resolvers/zod';
import { IconExternalLink, IconMessagePlus } from '@tabler/icons-react';
import {
  Button,
  Dialog,
  Form,
  Input,
  Label,
  Select,
  Separator,
  Spinner,
  Textarea,
  toast,
} from 'erxes-ui';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { FACEBOOK_POST_SCHEMA } from '../constants/FbPostSchema';
import { useFacebookCreatePost } from '../hooks/useFacebookCreatePost';

export const FacebookCreatePostDialog = ({ id }: { id: string }) => {
  const { t } = useTranslation('frontline');
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <div className="flex items-center gap-2 w-full">
          <IconMessagePlus size={16} />
          {t('create-post')}
        </div>
      </Dialog.Trigger>
      <Dialog.Content className="p-0 gap-0 border-0 shadow-lg">
        <FacebookCreatePostForm id={id} setOpen={setOpen} />
      </Dialog.Content>
    </Dialog>
  );
};

export const FacebookCreatePostForm = ({
  id,
  setOpen,
}: {
  id: string;
  setOpen: (open: boolean) => void;
}) => {
  const { t } = useTranslation('frontline');
  const { loading, integrationDetail } = useIntegrationDetail({
    integrationId: id,
  });
  const { createPost, loading: posting } = useFacebookCreatePost();

  const [permalinkUrl, setPermalinkUrl] = useState<string | null>(null);

  const pages = integrationDetail?.facebookPage || [];

  const form = useForm<z.infer<typeof FACEBOOK_POST_SCHEMA>>({
    resolver: zodResolver(FACEBOOK_POST_SCHEMA),
    defaultValues: { pageId: '', message: '', link: '' },
  });

  useEffect(() => {
    if (pages.length > 0 && !form.getValues('pageId')) {
      form.setValue('pageId', pages[0].pageId);
    }
  }, [pages, form]);

  const onSubmit = (data: z.infer<typeof FACEBOOK_POST_SCHEMA>) => {
    createPost({
      variables: {
        erxesApiId: id,
        pageId: data.pageId,
        message: data.message,
        link: data.link || undefined,
      },
      onCompleted: (response) => {
        setPermalinkUrl(response?.facebookCreatePost?.permalinkUrl || null);
        toast({ title: t('post-published') });
        form.reset({ pageId: data.pageId, message: '', link: '' });
      },
      onError: (error: Error) => {
        toast({ title: error.message, variant: 'destructive' });
      },
    });
  };

  if (loading) return <Spinner className="p-20" />;

  return (
    <>
      <Dialog.Header className="flex-row items-center justify-between space-y-0 px-4 py-3">
        <Dialog.Title>{t('create-facebook-post')}</Dialog.Title>
      </Dialog.Header>
      <Separator />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="p-6 pb-8 space-y-6">
            {pages.length === 0 ? (
              <Label>{t('no-connected-pages')}</Label>
            ) : (
              <Form.Field
                name="pageId"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>{t('facebook-page')}</Form.Label>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <Form.Control>
                        <Select.Trigger id="facebook-page">
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
                    <Form.Message />
                  </Form.Item>
                )}
              />
            )}

            <Form.Field
              name="message"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>{t('post-message')}</Form.Label>
                  <Form.Control>
                    <Textarea
                      {...field}
                      rows={5}
                      placeholder={t('post-message-placeholder')}
                    />
                  </Form.Control>
                  <Form.Message />
                </Form.Item>
              )}
            />

            <Form.Field
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
          </div>
          <Separator />
          <Dialog.Footer className="flex justify-end py-4 px-6">
            <Button
              type="button"
              variant="ghost"
              disabled={posting}
              onClick={() => setOpen(false)}
            >
              {t('close')}
            </Button>
            <Button type="submit" disabled={posting || pages.length === 0}>
              {posting ? t('posting') : t('publish')}
            </Button>
          </Dialog.Footer>
        </form>
      </Form>
    </>
  );
};
