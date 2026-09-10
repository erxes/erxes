import { zodResolver } from '@hookform/resolvers/zod';
import { Form, Input } from 'erxes-ui';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { SelectBrands } from 'ui-modules';
import { FormValueEffectComponent } from '@/forms/components/FormValueEffectComponent';
import { SurveyMutateLayout } from '@/survey/components/mutate/SurveyMutateLayout';
import { SURVEY_GENERAL_DEFAULT_VALUES } from '@/survey/constants/surveySetupDefaultValues';
import {
  SURVEY_GENERAL_SCHEMA,
  TSurveyGeneral,
} from '@/survey/constants/surveySetupSchema';
import { surveySetupGeneralAtom } from '@/survey/states/surveySetupStates';

export const SurveyGeneral = () => {
  const { t } = useTranslation('frontline');
  const form = useForm<TSurveyGeneral>({
    resolver: zodResolver(SURVEY_GENERAL_SCHEMA),
    defaultValues: SURVEY_GENERAL_DEFAULT_VALUES,
  });

  return (
    <SurveyMutateLayout
      title={t('general-label')}
      description={t('general-settings')}
      form={form}
    >
      <FormValueEffectComponent form={form} atom={surveySetupGeneralAtom} />
      <div className="space-y-5">
        <Form.Field
          control={form.control}
          name="title"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>{t('survey-title', 'Title')}</Form.Label>
              <Form.Control>
                <Input
                  {...field}
                  placeholder={t(
                    'survey-title-placeholder',
                    'Internal name for this survey',
                  )}
                />
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
              <Form.Label>{t('brand')}</Form.Label>
              <SelectBrands.FormItem
                mode="single"
                disableCreateOption
                value={field.value || ''}
                onValueChange={(value) =>
                  field.onChange(
                    typeof value === 'string' && value ? value : null,
                  )
                }
              />
              <Form.Description>
                {t('choose-brand-description')}
              </Form.Description>
              <Form.Message />
            </Form.Item>
          )}
        />
      </div>
    </SurveyMutateLayout>
  );
};
