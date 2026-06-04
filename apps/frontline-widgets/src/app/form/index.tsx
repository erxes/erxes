import { useEffect, useState } from 'react';
import { useWidgetConnect } from './hooks/useWidgetConnect';
import { Dialog, hexToOklch, Skeleton } from 'erxes-ui';
import { Container } from './components/container';
import { ErxesFormProvider } from './context/erxesFormContext';
import { useAtomValue, useSetAtom } from 'jotai';
import {
  activeStepAtom,
  browserInfoAtom,
  customerIdAtom,
  showConfirmationAtom,
} from './states/erxesFormStates';
import { ErxesFormValues } from './components/ErxesFormValues';
import { getVisitorId, postMessage } from '@libs/utils';
import { ErxesFormFinal } from './components/ErxesFormFinal';

export const Form = () => {
  const [settings, setSettings] = useState<any>({});
  const { connectMutation, form, loading } = useWidgetConnect();
  const [settingAppearance, setSettingAppearance] = useState<any>(true);
  const activeStep = useAtomValue(activeStepAtom);
  const setBrowserInfo = useSetAtom(browserInfoAtom);
  const showConfirmation = useAtomValue(showConfirmationAtom);
  const customerId = useAtomValue(customerIdAtom);
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const loadType = form?.leadData?.loadType;
  const isPopup = loadType === 'popup';

  useEffect(() => {
    const storedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia?.(
      '(prefers-color-scheme: dark)',
    ).matches;
    if (storedTheme === 'dark' || (!storedTheme && prefersDark)) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.fromPublisher) {
        if (event.data.settings) {
          setSettings(event.data.settings);
        }
        if (event.data.theme === 'dark') {
          document.documentElement.classList.add('dark');
        } else if (event.data.theme === 'light') {
          document.documentElement.classList.remove('dark');
        }
        if (event.data.message === 'sendingBrowserInfo') {
          setBrowserInfo(event.data.browserInfo || {});
        }
        if (event.data.action === 'showPopup') {
          setIsPopupOpen(true);
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
      const connect = async () => {
        const cachedCustomerId = customerId || (await getVisitorId());
        connectMutation({
          variables: {
            channelId: settings.channel_id,
            formCode: settings.form_id,
            cachedCustomerId,
          },
        });
      };
      connect();
    }
  }, [connectMutation, settings, customerId]);

  useEffect(() => {
    if (form?.leadData?.primaryColor) {
      document.documentElement.style.setProperty(
        '--primary',
        hexToOklch(form?.leadData?.primaryColor, true) || '',
      );
    }
    setTimeout(() => setSettingAppearance(false));
  }, [form?.leadData?.primaryColor]);

  // Notify parent about connection so it can wire up [data-erxes-modal] click handlers
  useEffect(() => {
    if (!form) return;
    postMessage('fromForms', 'connected', {
      connectionInfo: {
        widgetsLeadConnect: { form: { leadData: form.leadData } },
      },
      settings,
    });
  }, [form?._id]);

  // Keep the parent container class in sync for popup mode
  useEffect(() => {
    if (!isPopup || !settings.form_id) return;
    postMessage('fromForms', 'changeContainerClass', {
      className: isPopupOpen
        ? 'erxes-modal-iframe'
        : 'erxes-modal-iframe hidden',
      settings,
    });
  }, [isPopup, isPopupOpen, settings.form_id]);

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
        !loading &&
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
              />
            ),
        )
      )}
    </ErxesFormProvider>
  );

  if (isPopup) {
    return (
      <Dialog open={isPopupOpen} onOpenChange={setIsPopupOpen}>
        <Dialog.Content className="p-0 border-none bg-transparent">
          {formContent}
          <div className="flex items-center gap-0.5 justify-center mt-1 text-primary-foreground text-[10px]">
            <span>
              Powered by <strong>Erxes</strong>
            </span>
          </div>
        </Dialog.Content>
      </Dialog>
    );
  }

  return (
    <Container settings={settings} loading={loading}>
      {formContent}
    </Container>
  );
};
