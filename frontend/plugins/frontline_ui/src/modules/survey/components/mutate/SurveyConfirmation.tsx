import { zodResolver } from '@hookform/resolvers/zod';
import { Badge, Form, InfoCard, Select } from 'erxes-ui';
import { useAtomValue } from 'jotai';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { FormValueEffectComponent } from '@/forms/components/FormValueEffectComponent';
import { SurveyMutateLayout } from '@/survey/components/mutate/SurveyMutateLayout';
import { SURVEY_CONFIRMATION_DEFAULT_VALUES } from '@/survey/constants/surveySetupDefaultValues';
import {
  SURVEY_CONFIRMATION_SCHEMA,
  TSurveyConfirmation,
} from '@/survey/constants/surveySetupSchema';
import { useSurveyMutate } from '@/survey/hooks/useSurveyMutate';
import {
  surveySetupConfirmationAtom,
  surveySetupContentAtom,
  surveySetupGeneralAtom,
} from '@/survey/states/surveySetupStates';
import { SURVEY_DURATIONS } from '@/survey/types/surveyTypes';

const NO_DURATION = 'none';

export const SurveyConfirmation = () => {
  const { t } = useTranslation('frontline');
  const general = useAtomValue(surveySetupGeneralAtom);
  const content = useAtomValue(surveySetupContentAtom);
  const { handleMutateSurvey, loading } = useSurveyMutate();

  const form = useForm<TSurveyConfirmation>({
    resolver: zodResolver(SURVEY_CONFIRMATION_SCHEMA),
    defaultValues: SURVEY_CONFIRMATION_DEFAULT_VALUES,
  });

  return (
    <SurveyMutateLayout
      title={t('confirmation-label')}
      description={t('confirmation-settings')}
      form={form}
      onSubmit={handleMutateSurvey}
      isLoading={loading}
    >
      <FormValueEffectComponent
        form={form}
        atom={surveySetupConfirmationAtom}
      />
      <div className="space-y-5">
        <Form.Field
          control={form.control}
          name="durationHours"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>{t('survey-duration', 'Duration')}</Form.Label>
              <Select
                value={field.value === null ? NO_DURATION : String(field.value)}
                onValueChange={(value) =>
                  field.onChange(value === NO_DURATION ? null : Number(value))
                }
              >
                <Form.Control>
                  <Select.Trigger>
                    <Select.Value />
                  </Select.Trigger>
                </Form.Control>
                <Select.Content>
                  {SURVEY_DURATIONS.map((duration) => (
                    <Select.Item
                      key={String(duration.value)}
                      value={
                        duration.value === null
                          ? NO_DURATION
                          : String(duration.value)
                      }
                    >
                      {duration.label}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select>
              <Form.Message />
            </Form.Item>
          )}
        />

        <InfoCard
          title={
            general.title ||
            t('survey-title-placeholder', 'Internal name for this survey')
          }
          description={t('survey-review-description', 'Review before you save')}
        >
          <div className="flex flex-col gap-2">
            {content.steps.map((step, index) => (
              <div
                key={step.key}
                className="rounded-lg border bg-background p-3"
              >
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="font-mono text-xs">
                    {`${t('survey-step', 'Step')} ${index + 1}`}
                  </Badge>
                  <span className="truncate text-sm font-medium">
                    {step.name || `${t('survey-step', 'Step')} ${index + 1}`}
                  </span>
                </div>
                <p className="mt-1.5 text-sm">{step.question}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {t('n-options', { count: step.options.length })}
                  {step.allowMultiselect
                    ? ` · ${t('allow-multiple-answers')}`
                    : ''}
                </p>
              </div>
            ))}
          </div>
        </InfoCard>
      </div>
    </SurveyMutateLayout>
  );
};
