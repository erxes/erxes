import { zodResolver } from '@hookform/resolvers/zod';
import { IconCode, IconTrash } from '@tabler/icons-react';
import {
  Button,
  Form,
  InfoCard,
  Input,
  Select,
  Spinner,
  Textarea,
  useConfirm,
  useToast,
} from 'erxes-ui';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { SelectBrand } from 'ui-modules';
import { z } from 'zod';
import { KNOWLEDGE_BASE_PATH, LANGUAGES } from '@/knowledgebase/constants';
import { KnowledgeBaseLayout } from '@/knowledgebase/shared/components/KnowledgeBaseLayout';
import {
  TopicBackgroundImageField,
  TopicColorField,
} from '@/knowledgebase/shared/components/TopicAppearanceFields';
import { TopicEmbedScriptDialog } from '@/knowledgebase/shared/components/TopicEmbedScriptDialog';
import { useTopicDetail } from '@/knowledgebase/shared/hooks/useTopicDetail';
import {
  useRemoveTopics,
  useSaveTopic,
} from '@/knowledgebase/topics/hooks/useTopicMutations';

const settingsSchema = z.object({
  title: z.string().trim().min(1, { message: 'Title is required' }),
  description: z.string().trim().optional(),
  code: z.string().trim().optional(),
  brandId: z.string().optional(),
  languageCode: z.string().optional(),
  color: z.string().min(1, { message: 'Color is required' }),
  backgroundImage: z.string().optional(),
});

type TSettingsForm = z.infer<typeof settingsSchema>;

export const TopicSettings = () => {
  const { t } = useTranslation('frontline');
  const { topicId = '' } = useParams();
  const navigate = useNavigate();
  const { confirm } = useConfirm();
  const { toast } = useToast();
  const { topic, loading, refetch } = useTopicDetail(topicId);
  const { saveTopic, loading: saving } = useSaveTopic();
  const { removeTopics, loading: removing } = useRemoveTopics();
  const [scriptOpen, setScriptOpen] = useState(false);

  const form = useForm<TSettingsForm>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      title: '',
      description: '',
      code: '',
      brandId: '',
      languageCode: '',
      color: '#4F46E5',
      backgroundImage: '',
    },
  });

  useEffect(() => {
    if (!topic) return;

    form.reset({
      title: topic.title || '',
      description: topic.description || '',
      code: topic.code || '',
      brandId: topic.brandId ?? topic.brand?._id ?? '',
      languageCode: topic.languageCode || '',
      color: topic.color || '#4F46E5',
      backgroundImage: topic.backgroundImage || '',
    });
  }, [topic, form]);

  const submit = form.handleSubmit(async (values) => {
    const saved = await saveTopic(values, topicId);

    if (saved) {
      refetch();
    }
  });

  const handleDelete = () =>
    confirm({
      message: t('kb-confirm-delete-topic', {
        title: topic?.title || t('unnamed-topic'),
        defaultValue:
          'Are you sure you want to delete "{{title}}"? All of its categories and articles will be removed.',
      }),
      options: {
        confirmationValue: 'delete',
        description: t(
          'kb-action-permanent',
          'This action is permanent and cannot be undone.',
        ),
      },
    }).then(async () => {
      try {
        await removeTopics([topicId]);
        toast({
          title: t('success'),
          description: t('kb-topic-deleted', 'Topic deleted'),
          variant: 'success',
        });
        navigate(KNOWLEDGE_BASE_PATH);
      } catch (error: unknown) {
        toast({
          title: t('error'),
          description:
            error instanceof Error ? error.message : t('something-went-wrong'),
          variant: 'destructive',
        });
      }
    });

  return (
    <KnowledgeBaseLayout
      topicId={topicId}
      topicTitle={topic?.title}
      section="kbsettings"
      actions={
        <Button
          onClick={submit}
          disabled={saving || loading}
          className="py-1 h-7"
        >
          {saving ? t('saving', 'Saving…') : t('save', 'Save')}
        </Button>
      }
    >
      {loading && !topic ? (
        <div className="flex justify-center items-center flex-auto">
          <Spinner />
        </div>
      ) : (
        <div className="overflow-auto flex-auto p-4">
          <div className="grid gap-4 items-start lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
            <Form {...form}>
              <form onSubmit={submit} className="grid gap-4">
                <InfoCard title={t('general', 'General')}>
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
                            <Input {...field} />
                          </Form.Control>
                          <Form.Message />
                        </Form.Item>
                      )}
                    />

                    <Form.Field
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <Form.Item>
                          <Form.Label>
                            {t('description', 'Description')}
                          </Form.Label>
                          <Form.Control>
                            <Textarea {...field} />
                          </Form.Control>
                          <Form.Message />
                        </Form.Item>
                      )}
                    />

                    <Form.Field
                      control={form.control}
                      name="code"
                      render={({ field }) => (
                        <Form.Item>
                          <Form.Label>{t('kb-code', 'Code')}</Form.Label>
                          <Form.Control>
                            <Input {...field} />
                          </Form.Control>
                          <Form.Message />
                        </Form.Item>
                      )}
                    />

                    <Form.Field
                      control={form.control}
                      name="brandId"
                      render={({ field }) => (
                        <Form.Item>
                          <Form.Label>{t('brand', 'Brand')}</Form.Label>
                          <SelectBrand.FormItem
                            value={field.value}
                            onValueChange={(value) =>
                              field.onChange(value as string)
                            }
                            placeholder={t('select-brand', 'Select a brand')}
                          />
                          <Form.Message />
                        </Form.Item>
                      )}
                    />

                    <Form.Field
                      control={form.control}
                      name="languageCode"
                      render={({ field }) => (
                        <Form.Item>
                          <Form.Label>{t('language', 'Language')}</Form.Label>
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <Form.Control>
                              <Select.Trigger className="w-full">
                                <Select.Value
                                  placeholder={t(
                                    'select-language',
                                    'Select a language',
                                  )}
                                />
                              </Select.Trigger>
                            </Form.Control>
                            <Select.Content>
                              {LANGUAGES.map((language) => (
                                <Select.Item
                                  key={language.value}
                                  value={language.value}
                                >
                                  {language.label}
                                </Select.Item>
                              ))}
                            </Select.Content>
                          </Select>
                          <Form.Message />
                        </Form.Item>
                      )}
                    />
                  </InfoCard.Content>
                </InfoCard>

                <InfoCard title={t('appearance', 'Appearance')}>
                  <InfoCard.Content>
                    <TopicColorField
                      control={form.control}
                      name="color"
                      t={t}
                    />
                    <TopicBackgroundImageField
                      control={form.control}
                      name="backgroundImage"
                      t={t}
                    />
                  </InfoCard.Content>
                </InfoCard>
              </form>
            </Form>

            <div className="grid gap-4">
              <InfoCard title={t('kb-installation', 'Installation')}>
                <InfoCard.Content>
                  <p className="text-sm text-muted-foreground">
                    {t(
                      'kb-embed-script-description',
                      'Copy the script below to embed this knowledge base on your website.',
                    )}
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    className="justify-self-start"
                    onClick={() => setScriptOpen(true)}
                  >
                    <IconCode className="mr-2 w-4 h-4" />
                    {t('kb-view-script', 'View script')}
                  </Button>
                </InfoCard.Content>
              </InfoCard>

              <InfoCard title={t('kb-danger-zone', 'Danger zone')}>
                <InfoCard.Content className="border border-destructive/30">
                  <p className="text-sm text-muted-foreground">
                    {t(
                      'kb-delete-topic-description',
                      'Deleting this topic removes all of its categories and articles.',
                    )}
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    className="justify-self-start text-destructive"
                    onClick={handleDelete}
                    disabled={removing}
                  >
                    <IconTrash className="mr-2 w-4 h-4" />
                    {t('kb-delete-topic', 'Delete Topic')}
                  </Button>
                </InfoCard.Content>
              </InfoCard>
            </div>
          </div>
        </div>
      )}

      <TopicEmbedScriptDialog
        topicId={topicId}
        open={scriptOpen}
        onOpenChange={setScriptOpen}
        t={t}
      />
    </KnowledgeBaseLayout>
  );
};
