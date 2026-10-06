import { currentOrganizationState, currentUserState } from 'ui-modules/states';

import { useAtomValue } from 'jotai';
import { useEffect } from 'react';
import { useVersion } from 'ui-modules';

declare global {
  interface Window {
    erxesSettings?: {
      messenger?: {
        integrationId?: string;
        email?: string;
        phone?: string;
        data?: Record<string, unknown>;
        companyData?: { name?: string };
        customerData?: {
          email?: string;
          phone?: string;
          firstName?: string;
          lastName?: string;
          userName?: string;
        };
      };
    };
  }
}

const MESSENGER_CONTAINER_ID = 'erxes-messenger-container';
const MESSENGER_SCRIPT_ID = 'erxes-messenger-bundle-script';
const MESSENGER_IFRAME_ID = 'erxes-messenger-iframe';

const DEFAULT_SUPPORT_INTEGRATION_ID = '9S6seo9wawN6cou8v';
const DEFAULT_WIDGETS_URL = 'https://w.officenext.erxes.io';

const getSubdomain = () => window.location.hostname.split('.')[0];

const getSupportMessengerConfig = () => {
  const domainFormat =
    window.env?.REACT_APP_WIDGETS_URL ||
    process.env.REACT_APP_WIDGETS_URL ||
    DEFAULT_WIDGETS_URL;

  return {
    integrationId:
      window.env?.REACT_APP_SUPPORT_MESSENGER_INTEGRATION_ID ||
      process.env.REACT_APP_SUPPORT_MESSENGER_INTEGRATION_ID ||
      DEFAULT_SUPPORT_INTEGRATION_ID,
    widgetsUrl: domainFormat
      .replace('<subdomain>', getSubdomain())
      .replace(/\/+$/, ''),
  };
};

export const SupportMessenger = () => {
  const currentUser = useAtomValue(currentUserState);
  const currentOrganization = useAtomValue(currentOrganizationState);
  const isSaas = useVersion('saas');

  useEffect(() => {
    if (!isSaas) {
      return;
    }

    const { integrationId, widgetsUrl } = getSupportMessengerConfig();

    window.erxesSettings = {
      ...window.erxesSettings,
      messenger: { ...window.erxesSettings?.messenger, integrationId },
    };

    const script = document.createElement('script');
    script.id = MESSENGER_SCRIPT_ID;
    script.src = `${widgetsUrl}/messengerBundle.js`;
    script.async = true;
    document.body.appendChild(script);

    return () => {
      script.remove();
      document.getElementById(MESSENGER_CONTAINER_ID)?.remove();
    };
  }, [isSaas]);

  useEffect(() => {
    const messenger = window.erxesSettings?.messenger;

    if (!isSaas || !messenger?.integrationId) {
      return;
    }

    const details = currentUser?.details as
      | { phone?: string; operatorPhone?: string }
      | undefined;

    const customerData = {
      email: currentUser?.email,
      phone: details?.phone ?? details?.operatorPhone,
      firstName: currentUser?.details?.firstName,
      lastName: currentUser?.details?.lastName,
      userName: currentUser?.username,
    };

    messenger.customerData = customerData;
    messenger.email = customerData.email;
    messenger.phone = customerData.phone;
    messenger.data = {
      firstName: customerData.firstName,
      lastName: customerData.lastName,
      userName: customerData.userName,
    };
    messenger.companyData = { name: currentOrganization?.name };

    const iframe = document.getElementById(
      MESSENGER_IFRAME_ID,
    ) as HTMLIFrameElement | null;

    if (!iframe?.contentWindow) {
      return;
    }

    const storedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia?.(
      '(prefers-color-scheme: dark)',
    )?.matches;

    iframe.contentWindow.postMessage(
      {
        fromPublisher: true,
        settings: messenger,
        storage: localStorage.getItem('erxes') || '{}',
        theme:
          storedTheme === 'dark' || (!storedTheme && prefersDark)
            ? 'dark'
            : 'light',
      },
      '*',
    );
  }, [isSaas, currentUser, currentOrganization]);

  return null;
};
