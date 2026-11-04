import { useSidePanel } from 'ui-modules';
import { IntegrationSteps } from '@/integrations/components/IntegrationSteps';
import { erxesMessengerSetupStepAtom } from '@/integrations/erxes-messenger/states/erxesMessengerSetupStates';
import { Button, Sheet, Spinner } from 'erxes-ui';
import { useEMEditSave } from '@/integrations/erxes-messenger/hooks/useEMEditSave';
import { useAtom } from 'jotai';
import { useTranslation } from 'react-i18next';

const EM_STEP_LABEL_KEYS = [
  'appearance',
  'greeting',
  'intro',
  'hours-availability',
  'settings',
  'config',
];

/** Arranges messenger setup steps with navigation, cancel, and save controls. */
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
  const { close } = useSidePanel();
  const [step, setStep] = useAtom(erxesMessengerSetupStepAtom);
  const editSave = useEMEditSave();

  /** Closes the panel while retaining this messenger draft. */
  const handleCancel = () => {
    close();
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
      <Sheet.Footer className="h-auto min-h-12 shrink-0 border-t px-2 gap-1 flex-wrap">
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

/** Returns to the previous messenger setup step when one is available. */
export const EMLayoutPreviousStepButton = () => {
  const { t } = useTranslation('frontline', {
    keyPrefix: 'modules.integrations',
  });
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
