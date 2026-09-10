import { Button, Form, ScrollArea, Sheet } from 'erxes-ui';
import { useAtom, useSetAtom } from 'jotai';
import { FieldValues, UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router';
import { IntegrationSteps } from '@/integrations/components/IntegrationSteps';
import {
  SURVEY_SETUP_STEPS,
  SURVEY_SETUP_STEPS_LENGTH,
} from '@/survey/constants/surveySetupDefaultValues';
import {
  surveySetupStepAtom,
  resetSurveySetupAtom,
} from '@/survey/states/surveySetupStates';

export const SurveyMutateLayout = <TValues extends FieldValues>({
  children,
  title,
  description,
  form,
  onSubmit,
  isLoading,
}: {
  children: React.ReactNode;
  title: string;
  description: string;
  form: UseFormReturn<TValues>;
  onSubmit?: (values: TValues) => void;
  isLoading?: boolean;
}) => {
  const { t } = useTranslation('frontline');
  const [step, setStep] = useAtom(surveySetupStepAtom);
  const { id, surveyId } = useParams<{ id: string; surveyId: string }>();
  const resetSurveySetup = useSetAtom(resetSurveySetupAtom);
  const navigate = useNavigate();

  const handleCancel = () => {
    resetSurveySetup();
    navigate(`/settings/frontline/channels/${id}/surveys`);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((values) => {
          onSubmit?.(values);
          setStep((prev) =>
            prev === SURVEY_SETUP_STEPS.CONFIRMATION ? prev : prev + 1,
          );
        })}
        className="flex-auto flex flex-col h-full overflow-hidden bg-sidebar"
      >
        <Sheet.Content className="grow overflow-hidden flex flex-col">
          <ScrollArea className="h-full">
            <IntegrationSteps
              step={step}
              title={title}
              stepsLength={SURVEY_SETUP_STEPS_LENGTH}
              description={description}
            />
            <div className="px-5">{children}</div>
          </ScrollArea>
        </Sheet.Content>
        <Sheet.Footer>
          <Button
            type="button"
            variant="secondary"
            className="mr-auto bg-border"
            onClick={handleCancel}
          >
            {t('cancel')}
          </Button>
          <SurveyMutateLayoutPreviousStepButton />
          <Button type="submit" disabled={isLoading}>
            {isLoading
              ? surveyId
                ? t('updating-survey', 'Updating survey...')
                : t('creating-survey', 'Creating survey...')
              : step === SURVEY_SETUP_STEPS.CONFIRMATION
              ? surveyId
                ? t('update-survey', 'Update survey')
                : t('create-survey', 'Create survey')
              : t('next-step')}
          </Button>
        </Sheet.Footer>
      </form>
    </Form>
  );
};

export const SurveyMutateLayoutPreviousStepButton = () => {
  const { t } = useTranslation('frontline');
  const [step, setStep] = useAtom(surveySetupStepAtom);

  return (
    <Button
      type="button"
      variant="secondary"
      className="bg-border"
      onClick={() => setStep(step - 1)}
      disabled={step === SURVEY_SETUP_STEPS.GENERAL}
    >
      {t('previous-step')}
    </Button>
  );
};
