import { IntegrationSteps } from '@/integrations/components/IntegrationSteps';
import { IconPlus } from '@tabler/icons-react';
import { Button, Sheet } from 'erxes-ui';
import { FacebookGetAccounts } from './FacebookGetAccounts';
import { useAtomValue, useSetAtom } from 'jotai';
import {
  activeFacebookFormStepAtom,
  resetFacebookAddStateAtom,
} from '../states/facebookStates';
import { FacebookGetPages } from './FacebookGetPages';
import { FacebookIntegrationSetup } from './FacebookIntegrationSetup';
import { useAtom } from 'jotai';
import { facebookFormSheetAtom } from '../states/facebookStates';

export const FacebookIntegrationFormSheet = () => {
  const [facebookFormSheet, setFacebookFormSheet] = useAtom(
    facebookFormSheetAtom,
  );

  return (
    <div>
      <Sheet open={facebookFormSheet} onOpenChange={setFacebookFormSheet}>
        <Sheet.Trigger asChild>
          <Button>
            <IconPlus />
            Add Facebook Messenger
          </Button>
        </Sheet.Trigger>
        <Sheet.View>
          <FacebookIntegrationAdd />
        </Sheet.View>
      </Sheet>
    </div>
  );
};

export const FacebookIntegrationAdd = () => {
  const activeStep = useAtomValue(activeFacebookFormStepAtom);

  return (
    <>
      {activeStep === 1 && <FacebookGetAccounts />}
      {activeStep === 2 && <FacebookGetPages />}
      {activeStep === 3 && <FacebookIntegrationSetup />}
    </>
  );
};

export const FacebookIntegrationFormLayout = ({
  children,
  actions,
}: {
  children: React.ReactNode;
  actions: React.ReactNode;
}) => {
  const resetForm = useSetAtom(resetFacebookAddStateAtom);

  return (
    <>
      <Sheet.Header>
        <Sheet.Title>Add Facebook Messenger</Sheet.Title>
        <Sheet.Close />
      </Sheet.Header>
      <Sheet.Content className="flex flex-col overflow-hidden">
        {children}
      </Sheet.Content>
      <Sheet.Footer>
        <Sheet.Close asChild>
          <Button
            className="mr-auto text-muted-foreground"
            variant="ghost"
            onClick={resetForm}
          >
            Cancel
          </Button>
        </Sheet.Close>
        {actions}
      </Sheet.Footer>
    </>
  );
};

export const FacebookIntegrationFormSteps = ({
  title,
  step,
  description,
}: {
  title: string;
  step: number;
  description: string;
}) => {
  return (
    <IntegrationSteps
      step={step}
      title="Connect accounts"
      stepsLength={3}
      description={description}
    />
  );
};
