import { IconX } from '@tabler/icons-react';
import { Button, Sheet } from 'erxes-ui';
import React, { useState } from 'react';
import IntegrationSteps from './IntegrationSteps';
import { INTEGRATIONS, OTHER_INTEGRATIONS } from '../../constants/integrations';
import { useParams } from 'react-router-dom';

type TProps = {
  children?: React.ReactNode;
};

export const AddIntegration = ({ children }: TProps) => {
  const params = useParams();
  const integrations = { ...INTEGRATIONS, ...OTHER_INTEGRATIONS };
  const integration = integrations[params.kind as keyof typeof integrations];
  const [open, setOpen] = useState<boolean>(false);
  const [step, setStep] = useState<number>(0);
  const handleNextStep = () => {
    setStep((prev) => (integration.steps[step].isFinal ? prev : prev + 1));
  };
  const handlePrevStep = () => {
    if (step > 0) {
      setStep((prev) => prev - 1);
    }
  };
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <Sheet.Trigger asChild>{children}</Sheet.Trigger>
      <Sheet.View className="p-0 flex flex-col gap-0">
        <Sheet.Header className="flex-row items-center py-4 px-5 relative flex-none">
          <Sheet.Title className="text-base">Add integration</Sheet.Title>
          <div className="absolute right-5 m-0 p-0 flex items-center justify-center">
            <Button
              type="button"
              className="aspect-square w-7 bg-accent"
              variant={'ghost'}
              onClick={() => setOpen((prev) => !prev)}
            >
              <IconX />
            </Button>
          </div>
        </Sheet.Header>
        <Sheet.Content className="grow size-full h-auto flex flex-col">
          <IntegrationSteps
            step={step}
            integration={integration}
            isEmpty={false}
          />
        </Sheet.Content>
        <Sheet.Footer className="sm:justify-between">
          <Button variant={'ghost'} onClick={() => setOpen(!open)}>
            Cancel
          </Button>
          <div className="flex gap-2 items-center">
            <Button
              variant={'ghost'}
              onClick={handlePrevStep}
              className="bg-accent"
            >
              Previous step
            </Button>
            <Button onClick={handleNextStep}>
              {integration.steps[step].isFinal ? 'Save' : 'Next step'}
            </Button>
          </div>
        </Sheet.Footer>
      </Sheet.View>
    </Sheet>
  );
};
