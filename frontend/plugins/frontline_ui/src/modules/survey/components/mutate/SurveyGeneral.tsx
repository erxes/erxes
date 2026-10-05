import { zodResolver } from '@hookform/resolvers/zod';
import { Form, Input } from 'erxes-ui';
import { useSetAtom } from 'jotai';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';
import { SelectBrands } from 'ui-modules';
import { FormValueEffectComponent } from '@/forms/components/FormValueEffectComponent';
import { SelectChannel } from '@/inbox/channel/components/SelectChannel';
import { SurveyMutateLayout } from '@/survey/components/mutate/SurveyMutateLayout';
import { SURVEY_GENERAL_DEFAULT_VALUES } from '@/survey/constants/surveySetupDefaultValues';
import {
  SURVEY_GENERAL_CREATE_SCHEMA,
  SURVEY_GENERAL_SCHEMA,
  TSurveyGeneral,
} from '@/survey/constants/surveySetupSchema';
import { useSurveySetupChannel } from '@/survey/hooks/useSurveySetupChannel';
import {
  surveySetupContentAtom,
  surveySetupGeneralAtom,
} from '@/survey/states/surveySetupStates';

export const SurveyGeneral = () => {
  const { t } = useTranslation('frontline');
  const { surveyId } = useParams<{ surveyId: string }>();
  const { isChannelRoute } = useSurveySetupChannel();
  const showChannelSelect = !isChannelRoute && !surveyId;
  const form = useForm<TSurveyGeneral>({
    resolver: zodResolver(
      showChannelSelect ? SURVEY_GENERAL_CREATE_SCHEMA : SURVEY_GENERAL_SCHEMA,
    ),
    defaultValues: SURVEY_GENERAL_DEFAULT_VALUES,
  });
  const setSurveyContent = useSetAtom(surveySetupContentAtom);

  // Ticket pipelines belong to a channel, so a channel change invalidates them.
  const clearTicketTargets = () =>
    setSurveyContent((content) => ({
      steps: content.steps.map((step) => ({
        ...step,
        options: step.options.map((option) => ({
          ...option,
          ticketPipelineId: null,
          ticketStatusId: null,
        })),
      })),
    }));

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
        {showChannelSelect && (
          <Form.Field
            control={form.control}
            name="channelId"
            render={({ field }) => (
              <Form.Item>
                <Form.Label>{t('channel-label', 'Channel')}</Form.Label>
                <SelectChannel.FormItem
                  value={field.value ?? ''}
                  mode="single"
                  onValueChange={(value) => {
                    const channelId = Array.isArray(value)
                      ? (value[0] ?? '')
                      : value;

                    if (channelId !== field.value) {
                      clearTicketTargets();
                    }

                    field.onChange(channelId);
                  }}
                />
                <Form.Message />
              </Form.Item>
            )}
          />
        )}
      </div>
    </SurveyMutateLayout>
  );
};
