import {
  IntegrationCreateButton,
  IntegrationFormSession,
} from '@/integrations/components/IntegrationPanelForm';
import { IntegrationType } from '@/types/Integration';
import { IntegrationSteps } from '@/integrations/components/IntegrationSteps';
import { Button, Sheet } from 'erxes-ui';
import { useAtomValue, useSetAtom } from 'jotai';
import { useTranslation } from 'react-i18next';
import { FbIntegrationProvider } from '@/integrations/facebook/contexts/FbIntegrationContext';
import {
  activeFacebookFormStepAtom,
  facebookFormSheetAtom,
  resetFacebookAddStateAtom,
} from '@/integrations/facebook/states/facebookStates';
import { FacebookGetAccounts } from '@/integrations/facebook/components/FacebookGetAccounts';
import { FacebookGetPages } from '@/integrations/facebook/components/FacebookGetPages';
import { FacebookIntegrationSetup } from '@/integrations/facebook/components/FacebookIntegrationSetup';

export const FacebookIntegrationFormSheet = ({
  isPost,
}: {
  isPost?: boolean;
}) => {
  const { t } = useTranslation('frontline', {
    keyPrefix: 'modules.integrations',
  });
  return (
    <IntegrationCreateButton
      kind={
        isPost
          ? IntegrationType.FACEBOOK_POST
          : IntegrationType.FACEBOOK_MESSENGER
      }
    >
      {isPost
        ? t('add-facebook-post-integration')
        : t('add-facebook-messenger-integration')}
    </IntegrationCreateButton>
  );
};

export const FacebookIntegrationPanelForm = ({
  isPost,
}: {
  isPost?: boolean;
}) => (
  <IntegrationFormSession
    state={facebookFormSheetAtom}
    value={true}
    closedValue={false}
  >
    <FbIntegrationProvider isPost={isPost}>
      <FacebookIntegrationForm />
    </FbIntegrationProvider>
  </IntegrationFormSession>
);

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
  const { t } = useTranslation('frontline', {
    keyPrefix: 'modules.integrations',
  });
  const resetForm = useSetAtom(resetFacebookAddStateAtom);

  return (
    <>
      <Sheet.Content className="flex flex-col overflow-hidden">
        {children}
      </Sheet.Content>
      <Sheet.Footer className="h-auto min-h-12 shrink-0 border-t px-2 gap-1">
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
  title,
  step,
}: {
  title: string;
  step: number;
}) => {
  return (
    <IntegrationSteps
      step={step}
      title={title}
      stepsLength={3}
      description=""
    />
  );
};
