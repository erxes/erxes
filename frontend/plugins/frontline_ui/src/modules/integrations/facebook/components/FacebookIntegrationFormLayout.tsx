import { IntegrationSteps } from '@/integrations/components/IntegrationSteps';
import { IconPlus } from '@tabler/icons-react';
import { Button, Sheet } from 'erxes-ui';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { useTranslation } from 'react-i18next';
import {
  activeFacebookFormStepAtom,
  facebookFormSheetAtom,
  resetFacebookAddStateAtom,
} from '../states/facebookStates';
import { FacebookGetAccounts } from './FacebookGetAccounts';
import { FacebookGetPages } from './FacebookGetPages';
import { FacebookIntegrationSetup } from './FacebookIntegrationSetup';

export const FacebookIntegrationFormSheet = () => {
  const { t } = useTranslation('frontline');
  const [facebookFormSheet, setFacebookFormSheet] = useAtom(
    facebookFormSheetAtom,
  );

  return (
    <div>
      <Sheet open={facebookFormSheet} onOpenChange={setFacebookFormSheet}>
        <Sheet.Trigger asChild>
          <Button>
            <IconPlus />
            {t('add-facebook-messenger-integration')}
          </Button>
        </Sheet.Trigger>
        <Sheet.View>
          <Sheet.Header>
            <Sheet.Title>{t('add-facebook-messenger')}</Sheet.Title>
            <Sheet.Description>
              {t('fb-messenger-setup-description')}
            </Sheet.Description>
            <Sheet.Close />
          </Sheet.Header>
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
  const { t } = useTranslation('frontline');
  const resetForm = useSetAtom(resetFacebookAddStateAtom);

  return (
    <>
      <Sheet.Header>
        <Sheet.Title>{t('add-facebook-messenger')}</Sheet.Title>
        <Sheet.Description>
          {t('fb-messenger-setup-description')}
        </Sheet.Description>
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
  title,
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
