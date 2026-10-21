import { IntegrationSteps } from '@/integrations/components/IntegrationSteps';
import { erxesMessengerSetupStepAtom } from '@/integrations/erxes-messenger/states/erxesMessengerSetupStates';
import { Button, Sheet, Spinner } from 'erxes-ui';
import { useEMEditSave } from '@/integrations/erxes-messenger/hooks/useEMEditSave';
import { useAtom, useSetAtom } from 'jotai';
import { resetErxesMessengerSetupAtom } from '@/integrations/erxes-messenger/states/EMSetupResetState';
import { useTranslation } from 'react-i18next';

// Every step keeps its values in its own atom, so jumping never loses input.
const EM_STEP_LABEL_KEYS = [
  'appearance',
  'greeting',
  'intro',
  'hours-availability',
  'settings',
  'config',
];

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
  const [step, setStep] = useAtom(erxesMessengerSetupStepAtom);
  const resetErxesMessengerSetup = useSetAtom(resetErxesMessengerSetupAtom);
  const editSave = useEMEditSave();

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
          stepLabels={EM_STEP_LABEL_KEYS.map((key) => t(key))}
          onStepClick={setStep}
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
        {editSave.canSave && step < 6 && (
          <Button
            type="button"
            onClick={editSave.save}
            disabled={editSave.loading}
          >
            {editSave.loading && <Spinner size="sm" />}
            {t('save')}
          </Button>
        )}
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
