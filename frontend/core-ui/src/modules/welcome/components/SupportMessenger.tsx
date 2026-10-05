import { useEffect } from 'react';

declare global {
  interface Window {
    erxesSettings?: {
      messenger?: { integrationId?: string };
    };
  }
}

const MESSENGER_CONTAINER_ID = 'erxes-messenger-container';
const MESSENGER_SCRIPT_ID = 'erxes-messenger-bundle-script';

const getSupportMessengerConfig = () => ({
  integrationId:
    window.env?.REACT_APP_SUPPORT_MESSENGER_INTEGRATION_ID ??
    process.env.REACT_APP_SUPPORT_MESSENGER_INTEGRATION_ID ??
    '9S6seo9wawN6cou8v',
  widgetsUrl:
    window.env?.REACT_APP_WIDGETS_URL ??
    process.env.REACT_APP_WIDGETS_URL ??
    'https://w.officenext.erxes.io',
});

/**
 * Embeds the erxes messenger widget on the welcome screen by injecting the
 * public messengerBundle.js — the same script a website visitor gets.
 * `REACT_APP_SUPPORT_MESSENGER_INTEGRATION_ID` and `REACT_APP_WIDGETS_URL`
 * override the integration and bundle origin per deployment.
 */
export const SupportMessenger = () => {
  useEffect(() => {
    const { integrationId, widgetsUrl } = getSupportMessengerConfig();

    window.erxesSettings = {
      ...window.erxesSettings,
      messenger: { integrationId },
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
  }, []);

  return null;
};
