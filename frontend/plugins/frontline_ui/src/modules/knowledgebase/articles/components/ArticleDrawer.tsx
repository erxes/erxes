import { zodResolver } from '@hookform/resolvers/zod';
import { IconPaperclip, IconUpload, IconX } from '@tabler/icons-react';
import {
  Button,
  Editor,
  Form,
  InfoCard,
  MultipleSelector,
  readImage,
  Select,
  Switch,
  Upload,
} from 'erxes-ui';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { TFunction } from 'i18next';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { useArticleDetail } from '@/knowledgebase/articles/hooks/useArticles';
import { useSaveArticle } from '@/knowledgebase/articles/hooks/useArticleMutations';
import { ARTICLE_STATUSES, REACTIONS } from '@/knowledgebase/constants';
import { KbFormSheet } from '@/knowledgebase/shared/components/KbFormSheet';
import { KbTextField } from '@/knowledgebase/shared/components/KbTextField';
import { ScheduleDateField } from '@/knowledgebase/articles/components/ScheduleDateField';
import { SelectKbCategory } from '@/knowledgebase/shared/components/SelectKbCategory';
import { SelectKbTopic } from '@/knowledgebase/shared/components/SelectKbTopic';

const attachmentSchema = z.object({
  url: z.string(),
  name: z.string().optional(),
  type: z.string().optional(),
  size: z.number().optional(),
  duration: z.number().optional(),
});

const articleSchema = z
  .object({
    title: z.string().trim().min(1, { message: 'Title is required' }),
    summary: z.string().trim().optional(),
    content: z.string().min(1, { message: 'Content is required' }),
    topicId: z.string().min(1, { message: 'Knowledge base is required' }),
    categoryId: z.string().min(1, { message: 'Category is required' }),
    status: z.string().min(1),
    isPrivate: z.boolean(),
    reactionChoices: z.array(z.string()),
    image: attachmentSchema.optional(),
    attachments: z.array(attachmentSchema),
    pdfAttachment: z.object({ pdf: attachmentSchema.optional() }).optional(),
    scheduledDate: z.string().optional(),
  })
  .superRefine((values, ctx) => {
    if (values.status !== 'scheduled') return;

    if (!values.scheduledDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['scheduledDate'],
        message: 'Pick when to publish',
      });
      return;
    }

    if (new Date(values.scheduledDate).getTime() <= Date.now()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['scheduledDate'],
        message: 'Pick a time in the future',
      });
    }
  });

type TArticleForm = z.infer<typeof articleSchema>;

const emptyArticle = (topicId: string, categoryId: string): TArticleForm => ({
  title: '',
  summary: '',
  content: '<p></p>',
  topicId,
  categoryId,
  status: 'draft',
  isPrivate: false,
  reactionChoices: [],
  image: undefined,
  attachments: [],
  pdfAttachment: undefined,
  scheduledDate: undefined,
});

type TMediaFile = { url: string; name: string };

type TAttachment = z.infer<typeof attachmentSchema>;

const AttachmentList = ({
  files,
  onRemove,
  t,
}: {
  files: TAttachment[];
  onRemove: (index: number) => void;
  t: TFunction;
}) => {
  if (!files.length) return null;

  return (
    <ul className="grid gap-1">
      {files.map((file, index) => (
        <li
          key={`${file.url}-${index}`}
          className="flex gap-2 items-center pr-1 pl-2 h-8 text-sm rounded-sm border"
        >
          <IconPaperclip className="size-4 shrink-0 text-muted-foreground" />
          <a
            href={readImage(file.url)}
            target="_blank"
            rel="noreferrer"
            className="flex-1 min-w-0 truncate hover:underline"
          >
            {file.name || file.url}
          </a>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            aria-label={t('remove', 'Remove')}
            onClick={() => onRemove(index)}
          >
            <IconX />
          </Button>
        </li>
      ))}
    </ul>
  );
};

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
    defaultValues: emptyArticle(topicId, categoryId),
  });

  const status = form.watch('status');
  const selectedTopicId = form.watch('topicId');

  useEffect(() => {
    form.reset(
      article
        ? {
            title: article.title || '',
            summary: article.summary || '',
            content: article.content || '<p></p>',
            topicId,
            categoryId: article.categoryId || categoryId,
            status: article.status || 'draft',
            isPrivate: article.isPrivate ?? false,
            reactionChoices: article.reactionChoices ?? [],
            image: article.image ?? undefined,
            attachments: article.attachments ?? [],
            pdfAttachment: article.pdfAttachment ?? undefined,
            scheduledDate: article.scheduledDate ?? undefined,
          }
        : emptyArticle(topicId, categoryId),
    );
  }, [article, topicId, categoryId, form]);

  const submit = form.handleSubmit(async (values) => {
    const saved = await saveArticle(
      {
        ...values,
        scheduledDate:
          values.status === 'scheduled' ? values.scheduledDate : undefined,
      },
      articleId ?? undefined,
    );

    if (!saved) return;

    onSaved?.();
    onClose();
    form.reset(emptyArticle(topicId, categoryId));
  });

  return (
    <KbFormSheet
      isOpen={isOpen}
      onClose={onClose}
      title={
        isEditing
          ? t('kb-edit-article', 'Edit Article')
          : t('kb-new-article', 'New Article')
      }
      submitLabel={
        isEditing
          ? t('kb-save-changes', 'Save Changes')
          : t('kb-create-article', 'Create Article')
      }
      loading={loading}
      onSubmit={submit}
      className="sm:max-w-5xl lg:max-w-6xl xl:max-w-[92rem]"
    >
      <Form {...form}>
        <form
          onSubmit={submit}
          className="grid gap-4 items-start p-4 lg:grid-cols-[minmax(0,2.4fr)_minmax(0,1fr)]"
        >
          <InfoCard title={t('content-label', 'Content')}>
            <InfoCard.Content>
              <KbTextField
                control={form.control}
                name="title"
                label={t('title-label', 'Title')}
                placeholder={t('kb-enter-article-title', 'Enter article title')}
                required
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <Form.Field
                  control={form.control}
                  name="topicId"
                  render={({ field }) => (
                    <Form.Item>
                      <Form.Label>
                        {t('knowledge-base', 'Knowledge Base')}{' '}
                        <span className="text-destructive">*</span>
                      </Form.Label>
                      <Form.Control>
                        <SelectKbTopic
                          value={field.value}
                          onValueChange={(nextTopicId) => {
                            if (nextTopicId === field.value) return;

                            field.onChange(nextTopicId);
                            form.setValue('categoryId', '');
                          }}
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
                          topicId={selectedTopicId}
                          value={field.value}
                          onValueChange={field.onChange}
                        />
                      </Form.Control>
                      <Form.Message />
                    </Form.Item>
                  )}
                />
              </div>

              <KbTextField
                control={form.control}
                name="summary"
                label={t('kb-summary', 'Summary')}
                placeholder={t(
                  'kb-enter-article-summary',
                  'Enter article summary',
                )}
                multiline
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

                {status === 'scheduled' && (
                  <Form.Field
                    control={form.control}
                    name="scheduledDate"
                    render={({ field }) => (
                      <Form.Item>
                        <Form.Label>
                          {t('kb-publish-on', 'Publish on')}
                        </Form.Label>
                        <ScheduleDateField
                          value={field.value}
                          onChange={field.onChange}
                        />
                        <Form.Description>
                          {t(
                            'kb-schedule-help',
                            'The article goes live on your help center at this time.',
                          )}
                        </Form.Description>
                        <Form.Message />
                      </Form.Item>
                    )}
                  />
                )}

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
                            field.onChange(value.map((item) => item.value))
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
                    <div className="py-3 first:pt-0 last:pb-0">
                      <MediaRow
                        label={t('kb-attachments', 'Attachments')}
                        description={t('kb-attachments-count', {
                          count: (field.value ?? []).length,
                          defaultValue: '{{count}} file(s) attached',
                        })}
                        actionLabel={t('kb-add-file', 'Add file')}
                        value=""
                        onSelect={(file) =>
                          file && field.onChange([...(field.value ?? []), file])
                        }
                      />
                      <AttachmentList
                        files={field.value ?? []}
                        onRemove={(index) =>
                          field.onChange(
                            (field.value ?? []).filter((_, i) => i !== index),
                          )
                        }
                        t={t}
                      />
                    </div>
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
    </KbFormSheet>
  );
};
