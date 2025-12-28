import { IntegrationSteps } from '@/integrations/components/IntegrationSteps';
import { Button, Form, ScrollArea, Sheet } from 'erxes-ui';
import { useAtom } from 'jotai';
import { formSetupStepAtom } from '../states/formSetupStates';
import { UseFormReturn } from 'react-hook-form';
import { z } from 'zod';

export const FormMutateLayout = ({
  children,
  title,
  description,
  form,
  onSubmit,
}: {
  children: React.ReactNode;
  title: string;
  description: string;
  form: UseFormReturn<z.infer<any>>;
  onSubmit: (values: z.infer<any>) => void;
}) => {
  const [step, setStep] = useAtom(formSetupStepAtom);
  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((values) => {
          onSubmit(values);
          setStep((prev) => prev + 1);
        })}
        className="flex-auto flex flex-col h-full overflow-hidden bg-sidebar"
      >
        <Sheet.Content className="grow overflow-hidden flex flex-col">
          <ScrollArea className="h-full">
            <IntegrationSteps
              step={1}
              title={title}
              stepsLength={7}
              description={description}
            />
            <div className="px-5">{children}</div>
          </ScrollArea>
        </Sheet.Content>
        <Sheet.Footer>
          <Button
            variant="secondary"
            className="mr-auto bg-border"
            onClick={() => null}
          >
            Cancel
          </Button>
          <FormMutateLayoutPreviousStepButton />
          <Button type="submit">
            {step === 7 ? 'Create form' : 'Next step'}
          </Button>
        </Sheet.Footer>
      </form>
    </Form>
  );
};

export const FormMutateLayoutPreviousStepButton = () => {
  const [step, setStep] = useAtom(formSetupStepAtom);
  return (
    <Button
      variant="secondary"
      className="bg-border"
      onClick={() => setStep(step - 1)}
      disabled={step === 1}
    >
      Previous step
    </Button>
  );
};
