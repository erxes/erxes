import { useEffect, useState } from 'react';
import { useWidgetConnect } from './hooks/useWidgetConnect';
import { Dialog, hexToOklch, Skeleton } from 'erxes-ui';
import { ErxesFormProvider } from './context/erxesFormContext';
import { useAtomValue, useSetAtom } from 'jotai';
import {
  activeStepAtom,
  browserInfoAtom,
  showConfirmationAtom,
} from './states/erxesFormStates';
import { ErxesFormValues } from './components/ErxesFormValues';
import { ErxesFormFinal } from './components/ErxesFormFinal';
import { useParams } from 'react-router-dom';

export const LiveForm = () => {
  const { id: channelId, formId } = useParams<{ id: string; formId: string }>();
  const { connectMutation, form, loading } = useWidgetConnect();
  const [settingAppearance, setSettingAppearance] = useState<any>(true);
  const activeStep = useAtomValue(activeStepAtom);
  const setBrowserInfo = useSetAtom(browserInfoAtom);
  const showConfirmation = useAtomValue(showConfirmationAtom);

  useEffect(() => {
    setBrowserInfo({
      userAgent: navigator.userAgent,
      url: window.location.href,
      language: navigator.language,
    });
  }, []);

  useEffect(() => {
    if (formId && channelId) {
      connectMutation({
        variables: {
          channelId,
          formCode: formId,
        },
      });
    }
  }, [connectMutation, formId, channelId]);

  useEffect(() => {
    if (form?.leadData?.primaryColor) {
      document.documentElement.style.setProperty(
        '--primary',
        hexToOklch(form?.leadData?.primaryColor, true) || '',
      );
    }
    setTimeout(() => setSettingAppearance(false));
  }, [form?.leadData?.primaryColor]);

  const { steps } = form?.leadData || {};

  const stepsArray = Object.values(steps || {});

  if (loading || settingAppearance) {
    return <Skeleton className="h-full" />;
  }

  if (!form) {
    return null;
  }

  const formContent = (
    <ErxesFormProvider form={form}>
      {showConfirmation ? (
        <ErxesFormFinal />
      ) : (
        stepsArray.length > 0 &&
        stepsArray
          .filter((step) => activeStep === step.order)
          .map((step) => (
            <ErxesFormValues
              key={step.name}
              step={step}
              stepsLength={stepsArray.length}
              isLastStep={
                step.order ===
                stepsArray.reduce(
                  (acc, curr) => (curr.order > acc ? curr.order : acc),
                  0,
                )
              }
            />
          ))
      )}
    </ErxesFormProvider>
  );

  return (
    <Dialog open>
      <Dialog.Content className="p-0">{formContent}</Dialog.Content>
    </Dialog>
  );
};
