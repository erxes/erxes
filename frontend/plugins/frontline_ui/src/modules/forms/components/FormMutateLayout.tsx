import { IntegrationSteps } from '@/integrations/components/IntegrationSteps';
import { Button, Form, ScrollArea, Sheet } from 'erxes-ui';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import {
  formSetupStepAtom,
  formEditingFieldDirtyAtom,
  resetFormSetupAtom,
} from '../states/formSetupStates';
import { FieldValues, UseFormReturn } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import {
  FORM_SETUP_STEPS,
  FORM_SETUP_STEPS_LENGTH,
} from '@/forms/constants/formStatesDefaultValues';

export const FormMutateLayout = <T extends FieldValues>({
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
  form: UseFormReturn<T>;
  onSubmit?: (values: T) => void;
  isLoading?: boolean;
}) => {
  const { t } = useTranslation('frontline', { keyPrefix: 'modules.forms' });
  const dirtyField = useAtomValue(formEditingFieldDirtyAtom);
  const [step, setStep] = useAtom(formSetupStepAtom);
  const { id, formId } = useParams<{ id: string; formId: string }>();

  const resetFormSetup = useSetAtom(resetFormSetupAtom);
  const navigate = useNavigate();

  const handleCancel = () => {
    resetFormSetup();
    if (!id) {
      navigate('/frontline/forms');
    } else navigate(`/frontline/settings/channels/${id}/forms`);
    return;
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((values) => {
          if (dirtyField || isLoading) return;
          onSubmit?.(values);
          setStep((prev) =>
            prev === FORM_SETUP_STEPS.CONFIRMATION ? prev : prev + 1,
          );
        })}
        className="flex-auto flex flex-col h-full overflow-hidden bg-sidebar"
      >
        <Sheet.Content className="grow overflow-hidden flex flex-col">
          <ScrollArea className="h-full">
            <IntegrationSteps
              step={step}
              title={title}
              stepsLength={FORM_SETUP_STEPS_LENGTH}
              description={description}
            />
            <div className="px-5">{children}</div>
          </ScrollArea>
        </Sheet.Content>
        <Sheet.Footer>
          <Button
            variant="secondary"
            className="mr-auto bg-border"
            type="button"
            disabled={dirtyField}
            onClick={handleCancel}
          >
            {t('cancel', 'Cancel')}
          </Button>
          <FormMutateLayoutPreviousStepButton />
          <Button type="submit" disabled={isLoading || dirtyField}>
            {isLoading
              ? formId
                ? t('updating-form', 'Updating form...')
                : t('creating-form', 'Creating form...')
              : step === FORM_SETUP_STEPS.CONFIRMATION
              ? formId
                ? t('update-form', 'Update form')
                : t('create-form', 'Create form')
              : t('next-step', 'Next step')}
          </Button>
        </Sheet.Footer>
      </form>
    </Form>
  );
};

export const FormMutateLayoutPreviousStepButton = () => {
  const { t } = useTranslation('frontline', { keyPrefix: 'modules.forms' });
  const dirtyField = useAtomValue(formEditingFieldDirtyAtom);
  const [step, setStep] = useAtom(formSetupStepAtom);
  return (
    <Button
      variant="secondary"
      className="bg-border"
      type="button"
      onClick={() => !dirtyField && setStep(step - 1)}
      disabled={dirtyField || step === FORM_SETUP_STEPS.GENERAL}
    >
      {t('previous-step', 'Previous step')}
    </Button>
  );
};
