import { IntegrationSteps } from '@/integrations/components/IntegrationSteps';
import { IconPlus } from '@tabler/icons-react';
import { Button, Sheet } from 'erxes-ui';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { useTranslation } from 'react-i18next';
import {
  FbIntegrationProvider,
  useFbIntegrationContext,
} from '../contexts/FbIntegrationContext';
import {
  activeFacebookFormStepAtom,
  facebookFormSheetAtom,
  resetFacebookAddStateAtom,
} from '../states/facebookStates';
import { FacebookGetAccounts } from './FacebookGetAccounts';
import { FacebookGetPages } from './FacebookGetPages';
import { FacebookIntegrationSetup } from './FacebookIntegrationSetup';

export const FacebookIntegrationFormSheet = ({
  isPost,
}: {
  isPost?: boolean;
}) => {
  const { t } = useTranslation('frontline');
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
              {isPost ? t('add-facebook-post-integration') : t('add-facebook-messenger-integration')}
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
  const { t } = useTranslation('frontline');
  const resetForm = useSetAtom(resetFacebookAddStateAtom);
  const { isPost } = useFbIntegrationContext();

  return (
    <>
      <Sheet.Header>
        <Sheet.Title>{isPost ? t('add-facebook-post') : t('add-facebook-messenger')}</Sheet.Title>
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
            {t('cancel')}
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
  const { t } = useTranslation('frontline');
  return (
    <IntegrationSteps
      step={step}
      title={t('connect-accounts')}
      stepsLength={3}
      description={description}
    />
  );
};
