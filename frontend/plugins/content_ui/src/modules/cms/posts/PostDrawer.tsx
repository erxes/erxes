import { useMutation } from '@apollo/client';
import { IconAlertCircle } from '@tabler/icons-react';
import { Button, Form, Input, Select, Sheet, Textarea, toast } from 'erxes-ui';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { POSTS_ADD } from '../graphql/queries';
import { POSTS_LIST } from './graphql/queries/postsListQueries';

interface Post {
  _id: string;
  title: string;
  content: string;
  status: string;
  type: string;
  clientPortalId: string;
  createdAt: string;
}

interface PostDrawerProps {
  post?: Post;
  isOpen: boolean;
  onClose: () => void;
  clientPortalId: string;
}

interface PostFormData {
  title: string;
  content: string;
  status: string;
  type: string;
  clientPortalId: string;
}

export function PostDrawer({
  post,
  isOpen,
  onClose,
  clientPortalId,
}: PostDrawerProps) {
  const { t } = useTranslation('content');
  const isEditing = !!post;
  const [hasPermissionError, setHasPermissionError] = useState(false);

  const form = useForm<PostFormData>({
    defaultValues: {
      title: '',
      content: '',
      status: 'draft',
      type: 'post',
      clientPortalId,
    },
  });

  useEffect(() => {
    if (post) {
      form.reset({
        title: post.title || '',
        content: post.content || '',
        status: post.status || 'draft',
        type: post.type || 'post',
        clientPortalId: post.clientPortalId || clientPortalId,
      });
    } else {
      form.reset({
        title: '',
        content: '',
        status: 'draft',
        type: 'post',
        clientPortalId,
      });
    }
    setHasPermissionError(false);
  }, [post, form, isOpen, clientPortalId]);

  const [addPost, { loading: saving }] = useMutation(POSTS_ADD, {
    refetchQueries: [
      {
        query: POSTS_LIST,
        variables: {
          clientPortalId,
          type: 'post',
          limit: 20,
        },
      },
    ],
    onCompleted: () => {
      onClose();
      form.reset();
      toast({
        title: t('success'),
        description: t('post-created-successfully'),
        variant: 'default',
      });
    },
    onError: (error) => {
      console.error('Post creation error:', error);

      const permissionError = error.graphQLErrors?.some(
        (e) =>
          e.message === 'Permission required' ||
          e.extensions?.code === 'INTERNAL_SERVER_ERROR',
      );

      if (permissionError) {
        setHasPermissionError(true);
        toast({
          title: t('permission-required'),
          description: t('post-permission-required-desc'),
          variant: 'destructive',
          duration: 8000,
        });
      } else {
        toast({
          title: t('error'),
          description:
            error.message || t('failed-to-create-post'),
          variant: 'destructive',
          duration: 5000,
        });
      }
    },
  });

  const onSubmit = (data: PostFormData) => {
    const input = {
      ...data,
    };

    addPost({
      variables: {
        input,
      },
    });
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <Sheet.View className="sm:max-w-lg p-0">
        <Sheet.Header className="border-b gap-3">
          <Sheet.Title>{isEditing ? t('edit-post') : t('new-post')}</Sheet.Title>
          <Sheet.Close />
        </Sheet.Header>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="p-4 space-y-4"
          >
            {hasPermissionError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                <div className="flex items-start gap-2">
                  <IconAlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-red-800">
                      {t('permission-required')}
                    </p>
                    <p className="text-red-700 mt-1">
                      {t('post-permission-inline-desc')}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <Form.Field
              control={form.control}
              name="title"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>{t('post-title')}</Form.Label>
                  <Form.Control>
                    <Input {...field} placeholder={t('enter-post-title')} required />
                  </Form.Control>
                  <Form.Message />
                </Form.Item>
              )}
            />

            <Form.Field
              control={form.control}
              name="content"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>{t('content')}</Form.Label>
                  <Form.Control>
                    <Textarea
                      {...field}
                      placeholder={t('enter-post-content')}
                      rows={6}
                    />
                  </Form.Control>
                  <Form.Message />
                </Form.Item>
              )}
            />

            <Form.Field
              control={form.control}
              name="status"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>{t('status')}</Form.Label>
                  <Form.Control>
                    <Select
                      {...field}
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <Select.Trigger>
                        <Select.Value placeholder={t('select-status')} />
                      </Select.Trigger>
                      <Select.Content>
                        <Select.Item value="draft">{t('draft')}</Select.Item>
                        <Select.Item value="published">{t('published')}</Select.Item>
                        <Select.Item value="archived">{t('archived')}</Select.Item>
                      </Select.Content>
                    </Select>
                  </Form.Control>
                  <Form.Message />
                </Form.Item>
              )}
            />

            <Form.Field
              control={form.control}
              name="type"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>{t('type')}</Form.Label>
                  <Form.Control>
                    <Select
                      {...field}
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <Select.Trigger>
                        <Select.Value placeholder={t('select-type')} />
                      </Select.Trigger>
                      <Select.Content>
                        <Select.Item value="post">{t('post')}</Select.Item>
                        <Select.Item value="article">{t('article')}</Select.Item>
                        <Select.Item value="page">{t('page')}</Select.Item>
                      </Select.Content>
                    </Select>
                  </Form.Control>
                  <Form.Message />
                </Form.Item>
              )}
            />

            <div className="flex justify-end space-x-2">
              <Button onClick={onClose} variant="outline">
                {t('cancel')}
              </Button>
              <Button type="submit" disabled={saving || hasPermissionError}>
                {saving
                  ? isEditing
                    ? t('saving')
                    : t('creating')
                  : hasPermissionError
                    ? t('permission-required')
                    : isEditing
                      ? t('save-changes')
                      : t('create-post')}
              </Button>
            </div>
          </form>
        </Form>
      </Sheet.View>
    </Sheet>
  );
}
