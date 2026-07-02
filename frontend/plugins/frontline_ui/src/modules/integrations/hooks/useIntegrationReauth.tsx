import { REACT_APP_API_URL, toast } from 'erxes-ui';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

const POPUP_FEATURES =
  'toolbar=no,location=no,directories=no,status=no,menubar=no,scrollbars=yes,resizable=yes';

/**
 * Re-authenticates a Facebook / Instagram integration through the Facebook
 * Login OAuth flow to refresh the granted permissions and access token. This is
 * used by the Repair action when the integration's health status is red, before
 * the repair mutation runs.
 *
 * @param loginPath        API path that starts the OAuth flow, e.g.
 *                         `/pl:frontline/facebook/fblogin`.
 * @param authMessageType  postMessage type the OAuth callback page sends back
 *                         on success.
 * @param onAuthorized     Called once the user finishes the Facebook login
 *                         successfully (e.g. to run the repair mutation).
 */
export const useIntegrationReauth = (
  loginPath: string,
  authMessageType: string,
  onAuthorized: () => void,
) => {
  const { t } = useTranslation('frontline');
  const [loading, setLoading] = useState(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const reauth = () => {
    if (loading) return;

    const width = 660;
    const height = 750;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;

    const popup = window.open(
      `${REACT_APP_API_URL}${loginPath}`,
      'Repair Integration',
      `${POPUP_FEATURES},width=${width},height=${height},top=${top},left=${left}`,
    );

    if (!popup) {
      toast({
        title: t('unable-to-open-authorization-window'),
        description: t('please-allow-popups'),
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);


    let succeeded = false;

    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type !== authMessageType) return;

      succeeded = true;
      popup.close();
    };

    window.addEventListener('message', handleMessage);

    const timer = setInterval(() => {
      if (!popup.closed) return;

      clearInterval(timer);
      window.removeEventListener('message', handleMessage);

      if (mountedRef.current) setLoading(false);

      if (succeeded) {
        onAuthorized();
      } else {
        toast({
          title: t('repair-failed'),
          description: t('authorization-cancelled'),
          variant: 'destructive',
        });
      }
    }, 500);
  };

  return { reauth, loading };
};
