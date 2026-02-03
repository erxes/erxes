import { useEffect, useState } from 'react';
import { useWidgetConnect } from './hooks/useWidgetConnect';
import { Skeleton } from 'erxes-ui';
import { ErxesForm } from './components/ErxesForm';
import { Container } from './components/container';
import { ErxesFormProvider } from './ context/erxesFormContext';

export const Form = () => {
  const [settings, setSettings] = useState<any>({});
  const { connectMutation, form, loading } = useWidgetConnect();
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.fromPublisher) {
        setSettings(event.data.settings || {});
      }
    };

    window.addEventListener('message', handleMessage);
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

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

  const { steps } = form?.leadData || {};

  return (
    <Container settings={settings} loading={loading}>
      {loading && <Skeleton className="h-full" />}
      {!loading && form && (
        <ErxesFormProvider form={form}>
          {!loading &&
            form &&
            steps &&
            Object.keys(steps).length > 0 &&
            Object.entries(steps)
              .sort((a, b) => a[1].order - b[1].order)
              .map(
                ([key, step], index) =>
                  activeStep === index && (
                    <ErxesForm key={step.name} step={step} />
                  ),
              )}
        </ErxesFormProvider>
      )}
    </Container>
  );
};
