import { IntegrationSteps } from '@/integrations/components/IntegrationSteps';
import { IconPlus } from '@tabler/icons-react';
import { Button, Sheet } from 'erxes-ui';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { useTranslation } from 'react-i18next';
import {
  activeWhatsappFormStepAtom,
  resetWhatsappAddStateAtom,
  whatsappFormSheetAtom,
} from '../states/whatsappStates';
import { WhatsappFacebookConnect } from './WhatsappFacebookConnect';
import { WhatsappGetPages } from './WhatsappGetPages';
import { WhatsappGetBusinessAccounts } from './WhatsappGetBusinessAccounts';
import { WhatsappIntegrationSetup } from './WhatsappIntegrationSetup';

export const WhatsappIntegrationFormSheet = () => {
  const { t } = useTranslation('frontline');
  const [whatsappFormSheet, setWhatsappFormSheet] = useAtom(
    whatsappFormSheetAtom,
  );
  const resetForm = useSetAtom(resetWhatsappAddStateAtom);

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      resetForm();
      return;
    }
    setWhatsappFormSheet(true);
  };

  return (
    <div>
      <Sheet open={whatsappFormSheet} onOpenChange={handleOpenChange}>
        <Sheet.Trigger asChild>
          <Button type="button">
            <IconPlus />
            {t('add-whatsapp-integration', 'Add WhatsApp integration')}
          </Button>
        </Sheet.Trigger>
        <Sheet.View>
          <WhatsappIntegrationForm />
        </Sheet.View>
      </Sheet>
    </div>
  );
};

export const WhatsappIntegrationForm = () => {
  const activeStep = useAtomValue(activeWhatsappFormStepAtom);

  return (
    <>
      {activeStep === 1 && <WhatsappFacebookConnect />}
      {activeStep === 2 && <WhatsappGetPages />}
      {activeStep === 3 && <WhatsappGetBusinessAccounts />}
      {activeStep === 4 && <WhatsappIntegrationSetup />}
    </>
  );
};

export const WhatsappIntegrationFormLayout = ({
  children,
  actions,
}: {
  children: React.ReactNode;
  actions: React.ReactNode;
}) => {
  const { t } = useTranslation('frontline');
  const resetForm = useSetAtom(resetWhatsappAddStateAtom);

  return (
    <>
      <Sheet.Header>
        <Sheet.Title>{t('add-whatsapp', 'Add WhatsApp')}</Sheet.Title>
        <Sheet.Close />
      </Sheet.Header>
      <Sheet.Content className="flex flex-col overflow-hidden">
        {children}
      </Sheet.Content>
      <Sheet.Footer>
        <Sheet.Close asChild>
          <Button
            type="button"
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

export const WhatsappIntegrationFormSteps = ({
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
      stepsLength={4}
      description={description}
    />
  );
};
