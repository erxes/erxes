import { zodResolver } from '@hookform/resolvers/zod';
import { IconUpload } from '@tabler/icons-react';
import {
  Button,
  Editor,
  Form,
  InfoCard,
  Input,
  MultipleSelector,
  ScrollArea,
  Select,
  Sheet,
  Switch,
  Textarea,
  Upload,
} from 'erxes-ui';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { useArticleDetail } from '@/knowledgebase/articles/hooks/useArticles';
import { useSaveArticle } from '@/knowledgebase/articles/hooks/useArticleMutations';
import { ARTICLE_STATUSES, REACTIONS } from '@/knowledgebase/constants';
import { SelectKbCategory } from '@/knowledgebase/shared/components/SelectKbCategory';

const attachmentSchema = z.object({
  url: z.string(),
  name: z.string().optional(),
  type: z.string().optional(),
  size: z.number().optional(),
  duration: z.number().optional(),
});

const articleSchema = z.object({
  title: z.string().trim().min(1, { message: 'Title is required' }),
  summary: z.string().trim().optional(),
  content: z.string().min(1, { message: 'Content is required' }),
  categoryId: z.string().min(1, { message: 'Category is required' }),
  status: z.string().min(1),
  isPrivate: z.boolean(),
  reactionChoices: z.array(z.string()),
  image: attachmentSchema.optional(),
  attachments: z.array(attachmentSchema),
  pdfAttachment: z.object({ pdf: attachmentSchema.optional() }).optional(),
});

type TArticleForm = z.infer<typeof articleSchema>;

const emptyArticle = (categoryId: string): TArticleForm => ({
  title: '',
  summary: '',
  content: '<p></p>',
  categoryId,
  status: 'draft',
  isPrivate: false,
  reactionChoices: [],
  image: undefined,
  attachments: [],
  pdfAttachment: undefined,
});

type TMediaFile = { url: string; name: string };

const MediaRow = ({
  label,
  description,
  actionLabel,
  value,
  onSelect,
  removable,
}: {
  label: string;
  description: string;
  actionLabel: string;
  value: string;
  onSelect: (file?: TMediaFile) => void;
  removable?: boolean;
}) => (
  <div className="py-3 first:pt-0 last:pb-0">
    <Upload.Root
      className="gap-3 items-center"
      value={value}
      onChange={(fileInfo) => {
        if (!('url' in fileInfo)) return;

        onSelect(
          fileInfo.url
            ? { url: fileInfo.url, name: fileInfo.fileInfo?.name || '' }
            : undefined,
        );
      }}
    >
      <Upload.Preview className="shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <div className="flex gap-1 items-center shrink-0">
        <Upload.Button size="sm" variant="outline" type="button">
          <IconUpload className="size-4" />
          {actionLabel}
        </Upload.Button>
        {removable && (
          <Upload.RemoveButton size="sm" variant="ghost" type="button" />
        )}
      </div>
    </Upload.Root>
  </div>
);

export const ArticleDrawer = ({
  articleId,
  topicId,
  categoryId,
  isOpen,
  onClose,
  onSaved,
}: {
  articleId?: string | null;
  topicId: string;
  categoryId: string;
  isOpen: boolean;
  onClose: () => void;
  onSaved?: () => void;
}) => {
  const { t } = useTranslation('frontline');
  const isEditing = !!articleId;
  const { article } = useArticleDetail(articleId);
  const { saveArticle, loading } = useSaveArticle();

  const form = useForm<TArticleForm>({
    resolver: zodResolver(articleSchema),
    defaultValues: emptyArticle(categoryId),
  });

  useEffect(() => {
    form.reset(
      article
        ? {
            title: article.title || '',
            summary: article.summary || '',
            content: article.content || '<p></p>',
            categoryId: article.categoryId || categoryId,
            status: article.status || 'draft',
            isPrivate: article.isPrivate ?? false,
            reactionChoices: article.reactionChoices ?? [],
            image: article.image ?? undefined,
            attachments: article.attachments ?? [],
            pdfAttachment: article.pdfAttachment ?? undefined,
          }
        : emptyArticle(categoryId),
    );
  }, [article, categoryId, form]);

  const submit = form.handleSubmit(async (values) => {
    const saved = await saveArticle(values, articleId ?? undefined);

    if (!saved) return;

    onSaved?.();
    onClose();
    form.reset(emptyArticle(categoryId));
  });

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Sheet.View className="p-0 sm:max-w-5xl lg:max-w-6xl xl:max-w-[92rem]">
        <Sheet.Header className="p-2.5 border-b">
          <Sheet.Title>
            {isEditing
              ? t('kb-edit-article', 'Edit Article')
              : t('kb-new-article', 'New Article')}
          </Sheet.Title>
          <Sheet.Close />
        </Sheet.Header>

        <Sheet.Content className="overflow-hidden flex-auto">
          <ScrollArea className="h-full">
            <Form {...form}>
              <form
                onSubmit={submit}
                className="grid gap-4 items-start p-4 lg:grid-cols-[minmax(0,2.4fr)_minmax(0,1fr)]"
              >
                <InfoCard title={t('content-label', 'Content')}>
                  <InfoCard.Content>
                    <Form.Field
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <Form.Item>
                          <Form.Label>
                            {t('title-label', 'Title')}{' '}
                            <span className="text-destructive">*</span>
                          </Form.Label>
                          <Form.Control>
                            <Input
                              {...field}
                              placeholder={t(
                                'kb-enter-article-title',
                                'Enter article title',
                              )}
                            />
                          </Form.Control>
                          <Form.Message />
                        </Form.Item>
                      )}
                    />

                    <Form.Field
                      control={form.control}
                      name="categoryId"
                      render={({ field }) => (
                        <Form.Item>
                          <Form.Label>
                            {t('kb-category', 'Category')}{' '}
                            <span className="text-destructive">*</span>
                          </Form.Label>
                          <Form.Control>
                            <SelectKbCategory
                              topicId={topicId}
                              value={field.value}
                              onValueChange={field.onChange}
                            />
                          </Form.Control>
                          <Form.Message />
                        </Form.Item>
                      )}
                    />

                    <Form.Field
                      control={form.control}
                      name="summary"
                      render={({ field }) => (
                        <Form.Item>
                          <Form.Label>{t('kb-summary', 'Summary')}</Form.Label>
                          <Form.Control>
                            <Textarea
                              {...field}
                              placeholder={t(
                                'kb-enter-article-summary',
                                'Enter article summary',
                              )}
                            />
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
                          <Form.Label>
                            {t('content-label', 'Content')}{' '}
                            <span className="text-destructive">*</span>
                          </Form.Label>
                          <Form.Control>
                            <Editor
                              initialContent={field.value}
                              onChange={field.onChange}
                              scope="KnowledgeBaseArticleContent"
                              isHTML
                              className="min-h-[26rem]"
                            />
                          </Form.Control>
                          <Form.Message />
                        </Form.Item>
                      )}
                    />
                  </InfoCard.Content>
                </InfoCard>

                <div className="grid gap-4">
                  <InfoCard title={t('kb-publishing', 'Publishing')}>
                    <InfoCard.Content>
                      <Form.Field
                        control={form.control}
                        name="status"
                        render={({ field }) => (
                          <Form.Item>
                            <Form.Label>{t('status', 'Status')}</Form.Label>
                            <Select
                              value={field.value}
                              onValueChange={field.onChange}
                            >
                              <Form.Control>
                                <Select.Trigger className="w-full">
                                  <Select.Value />
                                </Select.Trigger>
                              </Form.Control>
                              <Select.Content>
                                {ARTICLE_STATUSES.map((status) => (
                                  <Select.Item
                                    key={status.value}
                                    value={status.value}
                                  >
                                    {t(status.key, status.label)}
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
                        name="isPrivate"
                        render={({ field }) => (
                          <Form.Item className="flex flex-row gap-2 justify-between items-center">
                            <Form.Label className="mb-0">
                              {t('kb-is-private', 'Is Private')}
                            </Form.Label>
                            <Form.Control>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </Form.Control>
                          </Form.Item>
                        )}
                      />

                      <Form.Field
                        control={form.control}
                        name="reactionChoices"
                        render={({ field }) => (
                          <Form.Item>
                            <Form.Label>
                              {t('kb-reaction-choices', 'Reaction Choices')}
                            </Form.Label>
                            <Form.Control>
                              <MultipleSelector
                                options={REACTIONS}
                                value={(field.value ?? []).map((choice) => ({
                                  value: choice,
                                  label:
                                    REACTIONS.find(
                                      (reaction) => reaction.value === choice,
                                    )?.label || choice,
                                }))}
                                onChange={(value) =>
                                  field.onChange(
                                    value.map((item) => item.value),
                                  )
                                }
                              />
                            </Form.Control>
                            <Form.Message />
                          </Form.Item>
                        )}
                      />
                    </InfoCard.Content>
                  </InfoCard>

                  <InfoCard title={t('kb-media', 'Media')}>
                    <InfoCard.Content className="gap-0 divide-y">
                      <Form.Field
                        control={form.control}
                        name="image"
                        render={({ field }) => (
                          <MediaRow
                            label={t('image-label', 'Image')}
                            description={t(
                              'kb-image-help',
                              'Shown with the article on the published site.',
                            )}
                            actionLabel={t('kb-upload-image', 'Upload image')}
                            value={field.value?.url || ''}
                            onSelect={field.onChange}
                            removable
                          />
                        )}
                      />

                      <Form.Field
                        control={form.control}
                        name="attachments"
                        render={({ field }) => (
                          <MediaRow
                            label={t('kb-attachments', 'Attachments')}
                            description={t('kb-attachments-count', {
                              count: (field.value ?? []).length,
                              defaultValue: '{{count}} file(s) attached',
                            })}
                            actionLabel={t('kb-add-file', 'Add file')}
                            value=""
                            onSelect={(file) =>
                              file &&
                              field.onChange([...(field.value ?? []), file])
                            }
                          />
                        )}
                      />

                      <Form.Field
                        control={form.control}
                        name="pdfAttachment"
                        render={({ field }) => (
                          <MediaRow
                            label={t('kb-pdf-attachment', 'PDF Attachment')}
                            description={t(
                              'kb-pdf-help',
                              'Readers can page through it inside the article.',
                            )}
                            actionLabel={t('kb-upload-pdf', 'Upload PDF')}
                            value={field.value?.pdf?.url || ''}
                            onSelect={(file) =>
                              field.onChange(file ? { pdf: file } : undefined)
                            }
                            removable
                          />
                        )}
                      />
                    </InfoCard.Content>
                  </InfoCard>
                </div>
              </form>
            </Form>
          </ScrollArea>
        </Sheet.Content>

        <Sheet.Footer className="flex gap-1 justify-end p-2.5 border-t shrink-0 bg-background">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            {t('cancel', 'Cancel')}
          </Button>
          <Button type="submit" onClick={submit} disabled={loading}>
            {loading
              ? t('saving', 'Saving…')
              : isEditing
                ? t('kb-save-changes', 'Save Changes')
                : t('kb-create-article', 'Create Article')}
          </Button>
        </Sheet.Footer>
      </Sheet.View>
    </Sheet>
  );
};
