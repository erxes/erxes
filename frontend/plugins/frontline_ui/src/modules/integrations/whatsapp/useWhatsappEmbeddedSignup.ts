import { useMutation } from '@apollo/client';
import { toast } from 'erxes-ui';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  EmbeddedSignupEvent,
  FacebookSdk,
  embeddedSignupLoginOptions,
  isFacebookOrigin,
  loadFacebookSdk,
  parseEmbeddedSignupMessage,
} from './embeddedSignup';
import {
  WHATSAPP_EMBEDDED_SIGNUP_FINISH,
  WhatsappConnection,
  WhatsappEmbeddedSignupConfig,
} from './graphql';
import { useWhatsappTranslation } from './translations';

type FinishData = Extract<EmbeddedSignupEvent, { kind: 'finish' }>;

export type WhatsappSignupPhase = 'idle' | 'waiting' | 'verifying';
export type WhatsappSdkStatus = 'idle' | 'loading' | 'ready' | 'error';

// Meta may post the FINISH message just after the login callback.
const SESSION_INFO_TIMEOUT_MS = 10_000;
// A user-reported error arrives as a message shortly after the callback.
const CANCEL_GRACE_MS = 500;

interface SignupSession {
  code?: string;
  data?: FinishData;
  settled: boolean;
  timers: number[];
}

const newSession = (): SignupSession => ({ settled: false, timers: [] });

/**
 * Runs Meta's Embedded Signup popup and exchanges its result on the server.
 * The SDK is preloaded so FB.login runs inside the click's user activation.
 */
export const useWhatsappEmbeddedSignup = ({
  config,
  onConnected,
}: {
  config?: WhatsappEmbeddedSignupConfig;
  onConnected: (connection: WhatsappConnection) => void;
}) => {
  const { t } = useWhatsappTranslation();
  const [sdk, setSdk] = useState<FacebookSdk>();
  const [sdkStatus, setSdkStatus] = useState<WhatsappSdkStatus>('idle');
  const [phase, setPhase] = useState<WhatsappSignupPhase>('idle');
  const session = useRef<SignupSession>(newSession());
  const [finishSignup] = useMutation(WHATSAPP_EMBEDDED_SIGNUP_FINISH);

  const appId = config?.isConfigured ? config.appId : undefined;
  const graphVersion = config?.graphVersion;

  useEffect(() => {
    if (!appId || !graphVersion) return;

    let active = true;

    setSdkStatus('loading');
    loadFacebookSdk(appId, graphVersion)
      .then((loaded) => {
        if (!active) return;
        setSdk(loaded);
        setSdkStatus('ready');
      })
      .catch(() => {
        if (active) setSdkStatus('error');
      });

    return () => {
      active = false;
    };
  }, [appId, graphVersion]);

  const settle = useCallback(() => {
    const current = session.current;

    current.settled = true;
    current.timers.forEach((timer) => window.clearTimeout(timer));
    current.timers = [];
  }, []);

  const fail = useCallback(
    (description: string) => {
      if (session.current.settled) return;

      settle();
      setPhase('idle');
      toast({ title: t('failed'), description, variant: 'destructive' });
    },
    [settle, t],
  );

  const tryFinish = useCallback(async () => {
    const { code, data, settled } = session.current;

    if (!code || !data || settled) return;

    settle();
    setPhase('verifying');

    try {
      const result = await finishSignup({
        variables: {
          code,
          wabaId: data.wabaId,
          phoneNumberId: data.phoneNumberId,
          businessId: data.businessId,
        },
      });
      const connection = result.data?.whatsappEmbeddedSignupFinish;

      if (!connection) throw new Error(t('failed'));

      onConnected(connection);
      toast({
        title: t('connected'),
        description: t('connectedDescription'),
        variant: 'success',
      });
    } catch (error: unknown) {
      toast({
        title: t('failed'),
        description: error instanceof Error ? error.message : String(error),
        variant: 'destructive',
      });
    } finally {
      setPhase('idle');
    }
  }, [finishSignup, onConnected, settle, t]);

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      // Only Meta's Embedded Signup window may report a result.
      if (!isFacebookOrigin(event.origin)) return;

      const parsed = parseEmbeddedSignupMessage(event.origin, event.data);

      if (!parsed || session.current.settled) return;

      switch (parsed.kind) {
        case 'finish':
          session.current.data = parsed;
          void tryFinish();
          return;
        case 'only-waba':
          fail(t('noPhone'));
          return;
        case 'business-app':
          fail(t('businessAppUnsupported'));
          return;
        case 'cancel':
          // A bare cancel is the user closing the window; the login callback reports it.
          if (parsed.errorMessage) {
            fail(
              [
                `${t('metaError')}: ${parsed.errorMessage}`,
                parsed.errorCode && `code ${parsed.errorCode}`,
                parsed.sessionId && `session ${parsed.sessionId}`,
              ]
                .filter(Boolean)
                .join(' · '),
            );
          }
          return;
      }
    };

    window.addEventListener('message', onMessage);

    return () => window.removeEventListener('message', onMessage);
  }, [fail, t, tryFinish]);

  useEffect(() => settle, [settle]);

  const launch = useCallback(() => {
    if (!sdk || !config?.configId || phase !== 'idle') return;

    settle();
    session.current = newSession();
    setPhase('waiting');

    sdk.login((response) => {
      const code = response.authResponse?.code;
      const current = session.current;

      if (!code) {
        current.timers.push(
          window.setTimeout(() => fail(t('cancelled')), CANCEL_GRACE_MS),
        );
        return;
      }

      current.code = code;
      current.timers.push(
        window.setTimeout(
          () => fail(t('noSessionInfo')),
          SESSION_INFO_TIMEOUT_MS,
        ),
      );
      void tryFinish();
    }, embeddedSignupLoginOptions(config.configId));
  }, [config?.configId, fail, phase, sdk, settle, t, tryFinish]);

  return { launch, phase, sdkStatus };
};
