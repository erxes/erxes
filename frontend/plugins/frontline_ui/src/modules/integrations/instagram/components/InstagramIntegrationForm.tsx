import { IntegrationSteps } from '@/integrations/components/IntegrationSteps';
import { IconPlus } from '@tabler/icons-react';
import { Button, Sheet } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { InstagramGetAccounts } from './InstagramGetAccounts';
import { useAtomValue, useSetAtom } from 'jotai';
import {
  activeInstagramFormStepAtom,
  instagramFormSheetAtom,
  resetInstagramAddStateAtom,
} from '../states/instagramStates';
import { InstagramGetPages } from './InstagramGetPages';
import { InstagramIntegrationSetup } from './InstagramIntegrationSetup';
import { useAtom } from 'jotai';
import {
  IgIntegrationProvider,
  useIgIntegrationContext,
} from '../context/IgIntegrationContext';

export const InstagramIntegrationFormSheet = ({
  isPost,
}: {
  isPost?: boolean;
}) => {
  const { t } = useTranslation('frontline');
  const [instagramFormSheet, setInstagramFormSheet] = useAtom(
    instagramFormSheetAtom,
  );

  return (
    <IgIntegrationProvider isPost={isPost}>
      <div>
        <Sheet open={instagramFormSheet} onOpenChange={setInstagramFormSheet}>
          <Sheet.Trigger asChild>
            <Button>
              <IconPlus />
              {isPost ? t('add-instagram-post-integration') : t('add-instagram-messenger-integration')}
            </Button>
          </Sheet.Trigger>
          <Sheet.View>
            <InstagramIntegrationForm />
          </Sheet.View>
        </Sheet>
      </div>
    </IgIntegrationProvider>
  );
};

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
  const { t } = useTranslation('frontline');
  const resetForm = useSetAtom(resetInstagramAddStateAtom);
  const { isPost } = useIgIntegrationContext();

  return (
    <>
      <Sheet.Header>
        <Sheet.Title>{isPost ? t('add-instagram-post') : t('add-instagram-messenger')}</Sheet.Title>
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

export const InstagramIntegrationFormSteps = ({
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
      title={title}
      stepsLength={3}
      description={description}
    />
  );
};
