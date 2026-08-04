import { IntegrationSteps } from '@/integrations/components/IntegrationSteps';
import { Button, Form, ScrollArea, Sheet } from 'erxes-ui';
import { useAtom, useSetAtom } from 'jotai';
import {
  formSetupStepAtom,
  resetFormSetupAtom,
} from '../states/formSetupStates';
import { UseFormReturn } from 'react-hook-form';
import { z } from 'zod';
import { useNavigate, useParams } from 'react-router';
import { useTranslation } from 'react-i18next';

export const FormMutateLayout = ({
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
  form: UseFormReturn<z.infer<any>>;
  onSubmit?: (values: z.infer<any>) => void;
  isLoading?: boolean;
}) => {
  const { t } = useTranslation('frontline');
  const [step, setStep] = useAtom(formSetupStepAtom);
  const { id } = useParams<{ id: string }>();

  const resetFormSetup = useSetAtom(resetFormSetupAtom);
  const navigate = useNavigate();

  const handleCancel = () => {
    resetFormSetup();
    if (!id) {
      navigate('/frontline/forms');
    } else navigate(`/settings/frontline/channels/${id}/forms`);
    return;
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((values) => {
          onSubmit?.(values);
          setStep((prev) => (prev === 3 ? prev : prev + 1));
        })}
        className="flex-auto flex flex-col h-full overflow-hidden bg-sidebar"
      >
        <Sheet.Content className="grow overflow-hidden flex flex-col">
          <ScrollArea className="h-full">
            <IntegrationSteps
              step={step}
              title={title}
              stepsLength={3}
              description={description}
            />
            <div className="px-5">{children}</div>
          </ScrollArea>
        </Sheet.Content>
        <Sheet.Footer>
          <Button
            variant="secondary"
            className="mr-auto bg-border"
            onClick={handleCancel}
          >
            {t('cancel')}
          </Button>
          <FormMutateLayoutPreviousStepButton />
          <Button type="submit" disabled={isLoading}>
            {isLoading
              ? id
                ? t('updating-form')
                : t('creating-form')
              : step === 3
              ? id
                ? t('update-form')
                : t('create-form')
              : t('next-step')}
          </Button>
        </Sheet.Footer>
      </form>
    </Form>
  );
};

export const FormMutateLayoutPreviousStepButton = () => {
  const { t } = useTranslation('frontline');
  const [step, setStep] = useAtom(formSetupStepAtom);
  return (
    <Button
      variant="secondary"
      className="bg-border"
      onClick={() => setStep(step - 1)}
      disabled={step === 1}
    >
      {t('previous-step')}
    </Button>
  );
};
