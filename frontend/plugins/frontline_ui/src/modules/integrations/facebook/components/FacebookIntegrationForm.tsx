import {
  authorizedFacebookAccountAtom,
  selectedFacebookAccountAtom,
  selectedFacebookPageAtom,
  activeFacebookFormStepAtom,
} from '@/integrations/facebook/states/facebookStates';
import {
  createIntegrationAtomDraft,
  useIntegrationAuthorization,
} from '@/integrations/hooks/useIntegrationDraft';
import { useSidePanel } from 'ui-modules';
import { IntegrationCreateButton } from '@/integrations/components/IntegrationPanelForm';
import { IntegrationType } from '@/types/Integration';
import { IntegrationSteps } from '@/integrations/components/IntegrationSteps';
import { Button, Sheet } from 'erxes-ui';
import { useAtomValue } from 'jotai';
import { useTranslation } from 'react-i18next';
import { FbIntegrationProvider } from '@/integrations/facebook/contexts/FbIntegrationContext';
import { FacebookGetAccounts } from '@/integrations/facebook/components/FacebookGetAccounts';
import { FacebookGetPages } from '@/integrations/facebook/components/FacebookGetPages';
import { FacebookIntegrationSetup } from '@/integrations/facebook/components/FacebookIntegrationSetup';

const useAccountDraft = createIntegrationAtomDraft(
  selectedFacebookAccountAtom,
  () => undefined,
);
const usePageDraft = createIntegrationAtomDraft(
  selectedFacebookPageAtom,
  () => undefined,
);
const useStepDraft = createIntegrationAtomDraft(activeFacebookFormStepAtom, 1);

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

/** Renders the active account, page, or configuration step for Facebook setup. */
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

/** Renders the active Facebook integration setup step. */
export const FacebookIntegrationPanelForm = ({
  isPost,
}: {
  isPost?: boolean;
}) => {
  useAccountDraft();
  usePageDraft();
  useStepDraft();
  useIntegrationAuthorization(
    authorizedFacebookAccountAtom,
    selectedFacebookAccountAtom,
    selectedFacebookPageAtom,
    activeFacebookFormStepAtom,
  );
  return (
    <FbIntegrationProvider isPost={isPost}>
      <FacebookIntegrationForm />
    </FbIntegrationProvider>
  );
};

/** Arranges Facebook setup content and its step actions. */
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
  const { close } = useSidePanel();

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
            onClick={() => {
              close();
            }}
          >
            {t('cancel')}
          </Button>
        </Sheet.Close>
        {actions}
      </Sheet.Footer>
    </>
  );
};

/** Renders progress for the three-step Facebook integration wizard. */
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
