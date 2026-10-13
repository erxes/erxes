import { Form, InfoCard, Select } from 'erxes-ui';
import { TFunction } from 'i18next';
import type { UseFormReturn } from 'react-hook-form';
import { SelectBrand } from 'ui-modules';
import { z } from 'zod';
import { LANGUAGES } from '@/knowledgebase/constants';
import { KbTextField } from '@/knowledgebase/shared/components/KbTextField';
import {
  TopicBackgroundImageField,
  TopicColorField,
} from '@/knowledgebase/shared/components/TopicAppearanceFields';
import { ITopic } from '@/knowledgebase/types';

export const topicSchema = z.object({
  title: z.string().trim().min(1, { message: 'Title is required' }),
  description: z.string().trim().optional(),
  code: z.string().trim().optional(),
  brandId: z.string().optional(),
  languageCode: z.string().optional(),
  color: z.string().min(1, { message: 'Color is required' }),
  backgroundImage: z.string().optional(),
});

export type TTopicForm = z.infer<typeof topicSchema>;

export const EMPTY_TOPIC: TTopicForm = {
  title: '',
  description: '',
  code: '',
  brandId: '',
  languageCode: '',
  color: '#4F46E5',
  backgroundImage: '',
};

export const topicToForm = (topic: ITopic): TTopicForm => ({
  title: topic.title || '',
  description: topic.description || '',
  code: topic.code || '',
  brandId: topic.brandId ?? topic.brand?._id ?? '',
  languageCode: topic.languageCode || '',
  color: topic.color || EMPTY_TOPIC.color,
  backgroundImage: topic.backgroundImage || '',
});

export const TopicFormFields = ({
  form,
  t,
}: {
  form: UseFormReturn<TTopicForm>;
  t: TFunction;
}) => (
  <>
    <InfoCard title={t('general', 'General')}>
      <InfoCard.Content>
        <KbTextField
          control={form.control}
          name="title"
          label={t('title-label', 'Title')}
          placeholder={t('kb-enter-topic-title', 'Enter topic title')}
          required
        />
        <KbTextField
          control={form.control}
          name="description"
          label={t('description', 'Description')}
          placeholder={t(
            'kb-enter-topic-description',
            'Enter topic description',
          )}
          description={t(
            'kb-topic-description-help',
            'Shown under the topic name on the published site.',
          )}
          className="min-h-20"
          multiline
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
                  onValueChange={(value) => field.onChange(value as string)}
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
                <Select value={field.value} onValueChange={field.onChange}>
                  <Form.Control>
                    <Select.Trigger className="w-full">
                      <Select.Value
                        placeholder={t('select-language', 'Select a language')}
                      />
                    </Select.Trigger>
                  </Form.Control>
                  <Select.Content>
                    {LANGUAGES.map((language) => (
                      <Select.Item key={language.value} value={language.value}>
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

        <KbTextField
          control={form.control}
          name="code"
          label={t('kb-code', 'Code')}
          placeholder={t('kb-enter-topic-code', 'Enter topic code')}
          description={t(
            'kb-topic-code-help',
            'Optional short code used in embeds and links.',
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
          defaultValue={EMPTY_TOPIC.color}
        />
        <TopicBackgroundImageField
          control={form.control}
          name="backgroundImage"
          t={t}
        />
      </InfoCard.Content>
    </InfoCard>
  </>
);
