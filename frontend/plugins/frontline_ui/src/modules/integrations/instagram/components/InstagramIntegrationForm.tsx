import {
  authorizedInstagramAccountAtom,
  selectedInstagramAccountAtom,
  selectedInstagramPageAtom,
  activeInstagramFormStepAtom,
} from '@/integrations/instagram/states/instagramStates';
import {
  createIntegrationAtomDraft,
  useIntegrationAuthorization,
} from '@/integrations/hooks/useIntegrationDraft';
import { useSidePanel } from 'ui-modules';
import { IntegrationCreateButton } from '@/integrations/components/IntegrationPanelForm';
import { IntegrationType } from '@/types/Integration';
import { IntegrationSteps } from '@/integrations/components/IntegrationSteps';
import { Button, Sheet } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { InstagramGetAccounts } from './InstagramGetAccounts';
import { useAtomValue } from 'jotai';
import { InstagramGetPages } from './InstagramGetPages';
import { InstagramIntegrationSetup } from './InstagramIntegrationSetup';
import { IgIntegrationProvider } from '@/integrations/instagram/context/IgIntegrationContext';

const useAccountDraft = createIntegrationAtomDraft(
  selectedInstagramAccountAtom,
  () => undefined,
);
const usePageDraft = createIntegrationAtomDraft(
  selectedInstagramPageAtom,
  () => undefined,
);
const useStepDraft = createIntegrationAtomDraft(activeInstagramFormStepAtom, 1);

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

/** Renders the active account, page, or configuration step for Instagram setup. */
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

/** Provides the Instagram integration mode to its setup wizard. */
export const InstagramIntegrationPanelForm = ({
  isPost,
}: {
  isPost?: boolean;
}) => {
  useAccountDraft();
  usePageDraft();
  useStepDraft();
  useIntegrationAuthorization(
    authorizedInstagramAccountAtom,
    selectedInstagramAccountAtom,
    selectedInstagramPageAtom,
    activeInstagramFormStepAtom,
  );
  return (
    <IgIntegrationProvider isPost={isPost}>
      <InstagramIntegrationForm />
    </IgIntegrationProvider>
  );
};

/** Arranges Instagram setup content, step actions, and cancellation controls. */
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

/** Renders progress for the three-step Instagram integration wizard. */
export const InstagramIntegrationFormSteps = ({
  title,
  step,
}: {
  title: string;
  step: number;
}) => {
  return <IntegrationSteps step={step} title={title} stepsLength={3} />;
};
