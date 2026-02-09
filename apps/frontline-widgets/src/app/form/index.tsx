import { useEffect, useState } from 'react';
import { useWidgetConnect } from './hooks/useWidgetConnect';
import { hexToOklch, Skeleton } from 'erxes-ui';
import { Container } from './components/container';
import { ErxesFormProvider } from './ context/erxesFormContext';
import { useAtomValue } from 'jotai';
import { activeStepAtom } from './states/erxesFormStates';
import { ErxesFormValues } from './components/ErxesFormValues';
import { postMessage } from '@libs/utils';

export const Form = () => {
  const [settings, setSettings] = useState<any>({});
  const { connectMutation, form, loading } = useWidgetConnect();
  const [settingAppearance, setSettingAppearance] = useState<any>(true);
  const activeStep = useAtomValue(activeStepAtom);
  const [browserInfo, setBrowserInfo] = useState<any>({});

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.fromPublisher) {
        setSettings(event.data.settings || {});
        if (event.data.message === 'sendingBrowserInfo') {
          setBrowserInfo(event.data.browserInfo || {});
        }
      }
    };

    window.addEventListener('message', handleMessage);
    if (loading) {
      postMessage('fromForms', 'requestingBrowserInfo', {
        settings,
      });
    }
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [loading]);

  useEffect(() => {
    if (settings.form_id && settings.channel_id) {
      connectMutation({
        variables: {
          channelId: settings.channel_id,
          formCode: settings.form_id,
        },
      });
    }
  }, [connectMutation, settings]);

  useEffect(() => {
    if (form?.leadData?.primaryColor) {
      document.documentElement.style.setProperty(
        '--primary',
        hexToOklch(form?.leadData?.primaryColor, true) || '',
      );
      setTimeout(() => setSettingAppearance(false));
    }
  }, [form?.leadData?.primaryColor]);

  const { steps } = form?.leadData || {};

  const stepsArray = Object.values(steps || {});

  return (
    <Container settings={settings} loading={loading}>
      {(loading || settingAppearance) && <Skeleton className="h-full" />}
      {!loading && !settingAppearance && form && (
        <ErxesFormProvider form={form}>
          {!loading &&
            form &&
            stepsArray.length > 0 &&
            stepsArray.map(
              (step) =>
                activeStep === step.order && (
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
                    browserInfo={browserInfo}
                  />
                ),
            )}
        </ErxesFormProvider>
      )}
    </Container>
  );
};
