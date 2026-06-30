import { IntegrationSteps } from '@/integrations/components/IntegrationSteps';
import { erxesMessengerSetupStepAtom } from '@/integrations/erxes-messenger/states/erxesMessengerSetupStates';
import { Button, Sheet } from 'erxes-ui';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { resetErxesMessengerSetupAtom } from '@/integrations/erxes-messenger/states/EMSetupResetState';
import { useTranslation } from 'react-i18next';

export const EMLayout = ({
  children,
  actions,
  title,
}: {
  children: React.ReactNode;
  actions: React.ReactNode;
  title: string;
}) => {
  const { t } = useTranslation('frontline');
  const step = useAtomValue(erxesMessengerSetupStepAtom);
  const resetErxesMessengerSetup = useSetAtom(resetErxesMessengerSetupAtom);

  const handleCancel = () => {
    resetErxesMessengerSetup();
  };

  return (
    <>
      <Sheet.Content className="grow overflow-hidden flex flex-col">
        <IntegrationSteps
          step={step}
          title={title}
          stepsLength={6}
          description=""
        />
        {children}
      </Sheet.Content>
      <Sheet.Footer>
        <Button
          variant="secondary"
          className="mr-auto bg-border"
          onClick={handleCancel}
        >
          {t('cancel')}
        </Button>
        {actions}
      </Sheet.Footer>
    </>
  );
};

export const EMLayoutPreviousStepButton = () => {
  const { t } = useTranslation('frontline');
  const [step, setStep] = useAtom(erxesMessengerSetupStepAtom);
  return (
    <Button
      variant="secondary"
      className="bg-border ml-auto"
      disabled={step === 1}
      onClick={() => setStep(step - 1)}
    >
      {t('previous-step')}
    </Button>
  );
};
