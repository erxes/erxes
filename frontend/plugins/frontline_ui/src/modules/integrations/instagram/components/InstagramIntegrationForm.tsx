import {
  IntegrationCreateButton,
  IntegrationFormSession,
} from '@/integrations/components/IntegrationPanelForm';
import { IntegrationType } from '@/types/Integration';
import { IntegrationSteps } from '@/integrations/components/IntegrationSteps';
import { Button, Sheet } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { InstagramGetAccounts } from './InstagramGetAccounts';
import { useAtomValue, useSetAtom } from 'jotai';
import {
  activeInstagramFormStepAtom,
  instagramFormSheetAtom,
  resetInstagramAddStateAtom,
} from '@/integrations/instagram/states/instagramStates';
import { InstagramGetPages } from './InstagramGetPages';
import { InstagramIntegrationSetup } from './InstagramIntegrationSetup';
import { IgIntegrationProvider } from '@/integrations/instagram/context/IgIntegrationContext';

export const InstagramIntegrationFormSheet = ({
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
          ? IntegrationType.INSTAGRAM_POST
          : IntegrationType.INSTAGRAM_MESSENGER
      }
    >
      {isPost
        ? t('add-instagram-post-integration')
        : t('add-instagram-messenger-integration')}
    </IntegrationCreateButton>
  );
};

export const InstagramIntegrationPanelForm = ({
  isPost,
}: {
  isPost?: boolean;
}) => (
  <IntegrationFormSession
    state={instagramFormSheetAtom}
    value={true}
    closedValue={false}
  >
    <IgIntegrationProvider isPost={isPost}>
      <InstagramIntegrationForm />
    </IgIntegrationProvider>
  </IntegrationFormSession>
);

export const InstagramIntegrationForm = () => {
  const activeStep = useAtomValue(activeInstagramFormStepAtom);

  return (
    <>
      {activeStep === 1 && <InstagramGetAccounts />}
      {activeStep === 2 && <InstagramGetPages />}
      {activeStep === 3 && <InstagramIntegrationSetup />}
    </>
  );
};

export const InstagramIntegrationFormLayout = ({
  children,
  actions,
}: {
  children: React.ReactNode;
  actions: React.ReactNode;
}) => {
  const { t } = useTranslation('frontline', {
    keyPrefix: 'modules.integrations',
  });
  const resetForm = useSetAtom(resetInstagramAddStateAtom);

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

export const InstagramIntegrationFormSteps = ({
  title,
  step,
}: {
  title: string;
  step: number;
}) => {
  return <IntegrationSteps step={step} title={title} stepsLength={3} />;
};
