import { IntegrationSteps } from '@/integrations/components/IntegrationSteps';
import { IconPlus } from '@tabler/icons-react';
import { Button, Sheet } from 'erxes-ui';
import { FacebookGetAccounts } from './FacebookGetAccounts';
import { useAtomValue, useSetAtom } from 'jotai';
import {
  activeFacebookFormStepAtom,
  facebookFormSheetAtom,
  resetFacebookAddStateAtom,
} from '../states/facebookStates';
import { FacebookGetPages } from './FacebookGetPages';
import { FacebookIntegrationSetup } from './FacebookIntegrationSetup';
import { useAtom } from 'jotai';
import {
  FbIntegrationProvider,
  useFbIntegrationContext,
} from '../contexts/FbIntegrationContext';

export const FacebookIntegrationFormSheet = ({
  isPost,
}: {
  isPost?: boolean;
}) => {
  const [facebookFormSheet, setFacebookFormSheet] = useAtom(
    facebookFormSheetAtom,
  );

  return (
    <FbIntegrationProvider isPost={isPost}>
      <div>
        <Sheet open={facebookFormSheet} onOpenChange={setFacebookFormSheet}>
          <Sheet.Trigger asChild>
            <Button>
              <IconPlus />
              Add Facebook{' '}
              {isPost ? 'Post integration' : 'Messenger integration'}
            </Button>
          </Sheet.Trigger>
          <Sheet.View>
            <FacebookIntegrationForm />
          </Sheet.View>
        </Sheet>
      </div>
    </FbIntegrationProvider>
  );
};

export const FacebookIntegrationForm = () => {
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
  const { isPost } = useFbIntegrationContext();

  return (
    <>
      <Sheet.Header>
        <Sheet.Title>Add Facebook {isPost ? 'Post' : 'Messenger'}</Sheet.Title>
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
