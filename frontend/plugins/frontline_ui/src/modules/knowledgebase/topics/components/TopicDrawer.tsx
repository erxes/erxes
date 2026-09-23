import { zodResolver } from '@hookform/resolvers/zod';
import {
  Button,
  Form,
  InfoCard,
  Input,
  ScrollArea,
  Select,
  Sheet,
  Textarea,
} from 'erxes-ui';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { SelectBrand } from 'ui-modules';
import { z } from 'zod';
import { LANGUAGES } from '@/knowledgebase/constants';
import {
  TopicBackgroundImageField,
  TopicColorField,
} from '@/knowledgebase/shared/components/TopicAppearanceFields';
import { useSaveTopic } from '@/knowledgebase/topics/hooks/useTopicMutations';
import { ITopic } from '@/knowledgebase/types';

const topicSchema = z.object({
  title: z.string().trim().min(1, { message: 'Title is required' }),
  description: z.string().trim().optional(),
  code: z.string().trim().optional(),
  brandId: z.string().optional(),
  languageCode: z.string().optional(),
  color: z.string().min(1, { message: 'Color is required' }),
  backgroundImage: z.string().optional(),
});

type TTopicForm = z.infer<typeof topicSchema>;

const EMPTY_TOPIC: TTopicForm = {
  title: '',
  description: '',
  code: '',
  brandId: '',
  languageCode: '',
  color: '#4F46E5',
  backgroundImage: '',
};

export const TopicDrawer = ({
  topic,
  isOpen,
  onClose,
  onSaved,
}: {
  topic?: ITopic;
  isOpen: boolean;
  onClose: () => void;
  onSaved?: () => void;
}) => {
  const { t } = useTranslation('frontline');
  const isEditing = !!topic;
  const { saveTopic, loading } = useSaveTopic();

  const form = useForm<TTopicForm>({
    resolver: zodResolver(topicSchema),
    defaultValues: EMPTY_TOPIC,
  });

  useEffect(() => {
    form.reset(
      topic
        ? {
            title: topic.title || '',
            description: topic.description || '',
            code: topic.code || '',
            brandId: topic.brandId ?? topic.brand?._id ?? '',
            languageCode: topic.languageCode || '',
            color: topic.color || EMPTY_TOPIC.color,
            backgroundImage: topic.backgroundImage || '',
          }
        : EMPTY_TOPIC,
    );
  }, [topic, form]);

  const submit = form.handleSubmit(async (values) => {
    const saved = await saveTopic(values, topic?._id);

    if (!saved) return;

    onSaved?.();
    onClose();
    form.reset(EMPTY_TOPIC);
  });

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Sheet.View className="p-0 sm:max-w-xl">
        <Sheet.Header className="p-2.5 border-b">
          <Sheet.Title>
            {isEditing
              ? t('kb-edit-topic', 'Edit Topic')
              : t('kb-new-topic', 'New Topic')}
          </Sheet.Title>
          <Sheet.Close />
        </Sheet.Header>

        <Sheet.Content className="overflow-hidden flex-auto">
          <ScrollArea className="h-full">
            <Form {...form}>
              <form onSubmit={submit} className="grid gap-4 p-4">
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
                            <Input
                              {...field}
                              placeholder={t(
                                'kb-enter-topic-title',
                                'Enter topic title',
                              )}
                            />
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
                            <Textarea
                              {...field}
                              className="min-h-20"
                              placeholder={t(
                                'kb-enter-topic-description',
                                'Enter topic description',
                              )}
                            />
                          </Form.Control>
                          <Form.Description>
                            {t(
                              'kb-topic-description-help',
                              'Shown under the topic name on the published site.',
                            )}
                          </Form.Description>
                          <Form.Message />
                        </Form.Item>
                      )}
                    />

                    <div className="grid gap-3 sm:grid-cols-2">
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
                    </div>

                    <Form.Field
                      control={form.control}
                      name="code"
                      render={({ field }) => (
                        <Form.Item>
                          <Form.Label>{t('kb-code', 'Code')}</Form.Label>
                          <Form.Control>
                            <Input
                              {...field}
                              placeholder={t(
                                'kb-enter-topic-code',
                                'Enter topic code',
                              )}
                            />
                          </Form.Control>
                          <Form.Description>
                            {t(
                              'kb-topic-code-help',
                              'Optional short code used in embeds and links.',
                            )}
                          </Form.Description>
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
                : t('kb-create-topic', 'Create Topic')}
          </Button>
        </Sheet.Footer>
      </Sheet.View>
    </Sheet>
  );
};
