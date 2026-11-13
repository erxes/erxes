import type { IArticleDetail } from '@/knowledgebase/types';
import { useKbPanelFormDraft } from '@/knowledgebase/shared/hooks/useKbPanelFormDraft';
import { articlePanelDraftsState } from '@/knowledgebase/shared/states/panelFormDraftsState';
import {
  KbFormItem,
  KbFormSection,
} from '@/knowledgebase/shared/components/KbFormLayout';
import { zodResolver } from '@hookform/resolvers/zod';
import { IconAlignLeft, IconPaperclip, IconX } from '@tabler/icons-react';
import {
  Button,
  Editor,
  Form,
  isDefined,
  MultipleSelector,
  readImage,
  Select,
  Switch,
  Textarea,
  Tooltip,
} from 'erxes-ui';
import { useAtomValue } from 'jotai';
import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useForm, type UseFormReturn } from 'react-hook-form';
import { PANEL_INPUT_CLASS_NAME } from 'ui-modules';
import { TFunction } from 'i18next';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { useArticleDetail } from '@/knowledgebase/articles/hooks/useArticles';
import { useSaveArticle } from '@/knowledgebase/articles/hooks/useArticleMutations';
import {
  articleMediaSlotsState,
  getArticleSlotKey,
} from '@/knowledgebase/articles/states/articleMediaSlotsState';
import {
  ARTICLE_CONTENT_TAB,
  ARTICLE_MEDIA_TAB,
  ARTICLE_STATUSES,
  REACTIONS,
} from '@/knowledgebase/constants';
import { KbImageUpload } from '@/knowledgebase/shared/components/TopicAppearanceFields';
import { KbFormSheet } from '@/knowledgebase/shared/components/KbFormSheet';
import { KbTextField } from '@/knowledgebase/shared/components/KbTextField';
import { ScheduleDateField } from '@/knowledgebase/articles/components/ScheduleDateField';
import { SelectKbCategory } from '@/knowledgebase/shared/components/SelectKbCategory';
import { SelectKbTopic } from '@/knowledgebase/shared/components/SelectKbTopic';
import { toKbAttachment } from '@/knowledgebase/utils/toKbAttachment';

const attachmentSchema = z.object({
  url: z.string(),
  name: z.string(),
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

export type TArticleForm = z.infer<typeof articleSchema>;

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
          key={file.url}
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
  captureSelect,
  removable,
  disabled,
}: {
  label: string;
  description: string;
  actionLabel: string;
  value: string;
  onSelect: (file?: TMediaFile) => void;
  captureSelect?: () => (file?: TMediaFile) => void;
  removable?: boolean;
  disabled: boolean;
}) => (
  <div className="py-3 first:pt-0 last:pb-0">
    <div className="mb-2 min-w-0">
      <p className="text-sm font-medium text-foreground">{label}</p>
      <p className="text-xs text-muted-foreground">{description}</p>
    </div>
    <KbImageUpload
      value={value}
      buttonLabel={actionLabel}
      disabled={disabled}
      removable={removable}
      onChange={(url, file) =>
        onSelect(url ? { url, name: file?.name || '' } : undefined)
      }
      captureChange={() => {
        const complete = captureSelect?.() ?? onSelect;
        return (url, file) =>
          complete(url ? { url, name: file?.name || '' } : undefined);
      }}
    />
  </div>
);

type TArticleFieldsProps = {
  form: UseFormReturn<TArticleForm>;
  t: TFunction;
};

type TArticleMediaFieldsProps = TArticleFieldsProps & {
  disabled: boolean;
  captureUpdate: (
    field?: string,
  ) => (update: (latest: TArticleForm) => TArticleForm) => void;
  invalidateUpdates: (field: string) => void;
};

const TruncatedRequiredLabel = ({ label }: { label: string }) => (
  <Tooltip.Provider delayDuration={100}>
    <Tooltip>
      <Tooltip.Trigger asChild>
        <span className="flex w-full min-w-0 items-center" title={label}>
          <span className="min-w-0 max-w-[4.75rem] flex-1 overflow-hidden text-ellipsis whitespace-nowrap">
            {label}
          </span>
          <span className="ml-0.5 shrink-0 text-destructive">*</span>
        </span>
      </Tooltip.Trigger>
      <Tooltip.Content>{label}</Tooltip.Content>
    </Tooltip>
  </Tooltip.Provider>
);

const ArticleContentFields = ({ form, t }: TArticleFieldsProps) => {
  const selectedTopicId = form.watch('topicId');

  return (
    <KbFormSection title={t('content-label', 'Content')}>
      <KbFormSection.Content>
        <KbTextField
          control={form.control}
          name="title"
          label={t('title-label', 'Title')}
          placeholder={t('kb-enter-article-title', 'Enter article title')}
          required
        />

        <div className="grid gap-1">
          <Form.Field
            control={form.control}
            name="topicId"
            render={({ field }) => (
              <KbFormItem
                label={
                  <TruncatedRequiredLabel
                    label={t('knowledge-base', 'Knowledge Base')}
                  />
                }
              >
                <Form.Control>
                  <SelectKbTopic
                    variant="table"
                    value={field.value}
                    onValueChange={(nextTopicId) => {
                      if (nextTopicId === field.value) return;

                      field.onChange(nextTopicId);
                      form.setValue('categoryId', '', { shouldDirty: true });
                    }}
                  />
                </Form.Control>
                <Form.Message />
              </KbFormItem>
            )}
          />

          <Form.Field
            control={form.control}
            name="categoryId"
            render={({ field }) => (
              <KbFormItem required label={t('kb-category', 'Category')}>
                <Form.Control>
                  <SelectKbCategory
                    variant="table"
                    topicId={selectedTopicId}
                    value={field.value}
                    onValueChange={field.onChange}
                  />
                </Form.Control>
                <Form.Message />
              </KbFormItem>
            )}
          />
        </div>
      </KbFormSection.Content>
    </KbFormSection>
  );
};

const ArticleBodyFields = ({ form, t }: TArticleFieldsProps) => (
  <KbFormSection title={t('content-label', 'Content')}>
    <KbFormSection.Content>
      <Form.Field
        control={form.control}
        name="summary"
        render={({ field }) => (
          <KbFormItem
            wide
            label={
              <span className="inline-flex items-center gap-1.5 font-medium">
                <IconAlignLeft className="size-3.5 shrink-0" aria-hidden />
                {t('kb-summary', 'Summary')}
              </span>
            }
          >
            <Form.Control>
              <Textarea
                {...field}
                value={field.value ?? ''}
                placeholder={t(
                  'kb-enter-article-summary',
                  'Enter article summary',
                )}
                className="min-h-20 rounded-sm shadow-none hover:bg-accent focus-visible:bg-background focus-visible:shadow-focus"
              />
            </Form.Control>
            <Form.Message />
          </KbFormItem>
        )}
      />

      <Form.Field
        control={form.control}
        name="content"
        render={({ field }) => (
          <KbFormItem
            wide
            required
            label={
              <span className="inline-flex items-center gap-1.5 font-medium">
                <IconAlignLeft className="size-3.5 shrink-0" aria-hidden />
                {t('content-label', 'Content')}
              </span>
            }
          >
            <Form.Control>
              <Editor
                initialContent={field.value}
                onChange={field.onChange}
                scope="KnowledgeBaseArticleContent"
                isHTML
                className="h-auto min-h-40 rounded-sm shadow-none hover:bg-accent focus-within:bg-background focus-within:shadow-focus"
              />
            </Form.Control>
            <Form.Message />
          </KbFormItem>
        )}
      />
    </KbFormSection.Content>
  </KbFormSection>
);

const ArticlePublishingFields = ({ form, t }: TArticleFieldsProps) => {
  const status = form.watch('status');

  return (
    <KbFormSection title={t('kb-publishing', 'Publishing')}>
      <KbFormSection.Content>
        <Form.Field
          control={form.control}
          name="status"
          render={({ field }) => (
            <KbFormItem label={t('status', 'Status')}>
              <Select value={field.value} onValueChange={field.onChange}>
                <Form.Control>
                  <Select.Trigger className={PANEL_INPUT_CLASS_NAME}>
                    <Select.Value />
                  </Select.Trigger>
                </Form.Control>
                <Select.Content>
                  {ARTICLE_STATUSES.map((status) => (
                    <Select.Item key={status.value} value={status.value}>
                      {t(status.key, status.label)}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select>
              <Form.Message />
            </KbFormItem>
          )}
        />

        {status === 'scheduled' && (
          <Form.Field
            control={form.control}
            name="scheduledDate"
            render={({ field }) => (
              <KbFormItem label={t('kb-publish-on', 'Publish on')}>
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
              </KbFormItem>
            )}
          />
        )}

        <Form.Field
          control={form.control}
          name="isPrivate"
          render={({ field }) => (
            <KbFormItem inline label={t('kb-is-private', 'Is Private')}>
              <Form.Control>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </Form.Control>
            </KbFormItem>
          )}
        />

        <Form.Field
          control={form.control}
          name="reactionChoices"
          render={({ field }) => (
            <KbFormItem label={t('kb-reaction-choices', 'Reaction Choices')}>
              <Form.Control>
                <MultipleSelector
                  className="shadow-none"
                  options={REACTIONS}
                  hidePlaceholderWhenSelected
                  value={(field.value ?? []).map((choice) => ({
                    value: choice,
                    label:
                      REACTIONS.find((reaction) => reaction.value === choice)
                        ?.label || choice,
                  }))}
                  onChange={(value) =>
                    field.onChange(value.map((item) => item.value))
                  }
                  inputProps={
                    field.value?.length
                      ? { className: 'w-20 min-w-16' }
                      : undefined
                  }
                />
              </Form.Control>
              <Form.Message />
            </KbFormItem>
          )}
        />
      </KbFormSection.Content>
    </KbFormSection>
  );
};

const ArticleMediaFields = ({
  form,
  t,
  captureUpdate,
  invalidateUpdates,
  disabled,
}: TArticleMediaFieldsProps) => (
  <KbFormSection title={t('kb-media', 'Media')}>
    <KbFormSection.Content className="gap-0 divide-y">
      <Form.Field
        control={form.control}
        name="image"
        render={({ field }) => (
          <MediaRow
            disabled={disabled}
            label={t('image-label', 'Image')}
            description={t(
              'kb-image-help',
              'Shown with the article on the published site.',
            )}
            actionLabel={t('kb-upload-image', 'Upload image')}
            value={field.value?.url || ''}
            onSelect={(image) => {
              invalidateUpdates('image');
              field.onChange(image);
            }}
            captureSelect={() => {
              const apply = captureUpdate('image');
              return (image) =>
                apply((latest) => (image ? { ...latest, image } : latest));
            }}
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
              disabled={disabled}
              label={t('kb-attachments', 'Attachments')}
              description={t('kb-attachments-count', {
                count: (field.value ?? []).length,
                defaultValue: '{{count}} file(s) attached',
              })}
              actionLabel={t('kb-add-file', 'Add file')}
              value=""
              captureSelect={() => {
                const apply = captureUpdate();
                return (file) =>
                  apply((latest) =>
                    file
                      ? {
                          ...latest,
                          attachments: [...latest.attachments, file],
                        }
                      : latest,
                  );
              }}
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
            disabled={disabled}
            label={t('kb-pdf-attachment', 'PDF Attachment')}
            description={t(
              'kb-pdf-help',
              'Readers can page through it inside the article.',
            )}
            actionLabel={t('kb-upload-pdf', 'Upload PDF')}
            value={field.value?.pdf?.url || ''}
            onSelect={(file) => {
              invalidateUpdates('pdfAttachment');
              field.onChange(file ? { pdf: file } : undefined);
            }}
            captureSelect={() => {
              const apply = captureUpdate('pdfAttachment');
              return (file) =>
                apply((latest) =>
                  file
                    ? {
                        ...latest,
                        pdfAttachment: { pdf: file },
                      }
                    : latest,
                );
            }}
            removable
          />
        )}
      />
    </KbFormSection.Content>
  </KbFormSection>
);

const ArticleFormFields = ({
  form,
  t,
  captureUpdate,
  invalidateUpdates,
  disabled,
  mediaTab,
  mediaSlot,
  contentSlot,
}: TArticleMediaFieldsProps & {
  mediaTab: boolean;
  mediaSlot?: HTMLElement;
  contentSlot?: HTMLElement;
}) => {
  const mediaFields = (
    <ArticleMediaFields
      form={form}
      t={t}
      captureUpdate={captureUpdate}
      invalidateUpdates={invalidateUpdates}
      disabled={disabled}
    />
  );

  return (
    <div className="flex flex-col gap-3">
      <ArticleContentFields form={form} t={t} />
      <ArticlePublishingFields form={form} t={t} />
      {contentSlot ? (
        createPortal(<ArticleBodyFields form={form} t={t} />, contentSlot)
      ) : (
        <ArticleBodyFields form={form} t={t} />
      )}
      {mediaSlot
        ? createPortal(mediaFields, mediaSlot)
        : !mediaTab && mediaFields}
    </div>
  );
};

export const ArticleDrawer = ({
  articleId,
  article: loadedArticle,
  topicId,
  categoryId,
  closeOnSave = true,
  mediaTab = false,
  contentTab = false,
  onClose,
  onSaved,
}: {
  articleId?: string | null;
  article?: IArticleDetail;
  topicId: string;
  categoryId: string;
  closeOnSave?: boolean;
  mediaTab?: boolean;
  contentTab?: boolean;
  onClose: () => void;
  onSaved?: () => void;
}) => {
  const { t } = useTranslation('frontline', {
    keyPrefix: 'modules.knowledgebase',
  });
  const { article: fetchedArticle } = useArticleDetail(
    loadedArticle ? undefined : articleId,
  );
  const article = loadedArticle ?? fetchedArticle;
  const { saveArticle, loading } = useSaveArticle();
  const mediaSlots = useAtomValue(articleMediaSlotsState);
  const mediaSlot =
    mediaTab && articleId
      ? mediaSlots[getArticleSlotKey(articleId, ARTICLE_MEDIA_TAB)]
      : undefined;
  const contentSlot =
    contentTab && articleId
      ? mediaSlots[getArticleSlotKey(articleId, ARTICLE_CONTENT_TAB)]
      : undefined;
  const [fieldsKey, setFieldsKey] = useState(0);

  const form = useForm<TArticleForm>({
    resolver: zodResolver(articleSchema),
    defaultValues: emptyArticle(topicId, categoryId),
  });

  const { dirtyFields } = form.formState;
  const {
    clearDraft,
    markSaved,
    isActive,
    save,
    saving,
    uploading,
    createdId,
    captureUpdate,
    invalidateUpdates,
  } = useKbPanelFormDraft({
    form,
    kind: 'article',
    recordId: articleId,
    context: [topicId, categoryId],
    onDeleted: onClose,
    values: article
      ? {
          title: article.title || '',
          summary: article.summary || '',
          content: article.content || '<p></p>',
          topicId: article.topicId || topicId,
          categoryId: article.categoryId || categoryId,
          status: article.status || 'draft',
          isPrivate: article.isPrivate ?? false,
          reactionChoices: (article.reactionChoices ?? []).filter(isDefined),
          image: article.image ? toKbAttachment(article.image) : undefined,
          attachments: (article.attachments ?? [])
            .filter(isDefined)
            .map(toKbAttachment),
          pdfAttachment: article.pdfAttachment?.pdf
            ? { pdf: toKbAttachment(article.pdfAttachment.pdf) }
            : undefined,
          scheduledDate: article.scheduledDate ?? undefined,
        }
      : emptyArticle(topicId, categoryId),
    draftsState: articlePanelDraftsState,
    discardMessage: t(
      'discard-unsaved-changes',
      'Discard your unsaved changes?',
    ),
  });

  const isEditing = Boolean(articleId || createdId);

  const cancel = () => {
    if (closeOnSave) {
      clearDraft();
      onClose();
      return;
    }
    form.reset();
    setFieldsKey((key) => key + 1);
  };

  const submit = form.handleSubmit(async (values) => {
    const submittedValues = structuredClone(form.getValues());
    const submittedDirtyFields = structuredClone(dirtyFields);
    const saved = await save((recordId) =>
      saveArticle(
        {
          ...values,
          scheduledDate:
            values.status === 'scheduled' ? values.scheduledDate : undefined,
        },
        recordId,
        recordId ? submittedDirtyFields : undefined,
      ),
    );

    if (!saved) return;

    if (!markSaved(values, submittedValues)) return;
    onSaved?.();
    if (closeOnSave && isActive()) onClose();
  });

  return (
    <KbFormSheet
      onClose={cancel}
      submitLabel={
        isEditing
          ? t('kb-save-changes', 'Save Changes')
          : t('kb-create-article', 'Create Article')
      }
      loading={loading || saving}
      uploading={uploading}
      onSubmit={submit}
    >
      <Form {...form}>
        <ArticleFormFields
          key={fieldsKey}
          form={form}
          t={t}
          captureUpdate={captureUpdate}
          invalidateUpdates={invalidateUpdates}
          disabled={loading || saving}
          mediaTab={mediaTab}
          mediaSlot={mediaSlot}
          contentSlot={contentSlot}
        />
      </Form>
    </KbFormSheet>
  );
};
