import { callConfigAtom } from '@/integrations/call/states/sipStates';
import { useAtomValue } from 'jotai';
import { useMemo } from 'react';
import { SipProvider } from './SipProvider';
import { useCallUserIntegration } from '@/integrations/call/hooks/useCallUserIntegration';
import { useCallGetConfigs } from '@/integrations/call/hooks/useCallGetConfigs';
import { useCurrentCallSession } from '@/integrations/call/hooks/useCurrentCallSession';
import { CallSelectConfig } from '@/integrations/call/components/CallSelectConfig';

const CallSessionBridge = () => {
  useCurrentCallSession();
  return null;
};

const isFilled = (value: unknown): value is string =>
  typeof value === 'string' && value.trim() !== '';

// Every URL must be STUN or TURN, and a TURN server needs its credentials.
const isIceServer = (value: unknown): value is RTCIceServer => {
  if (typeof value !== 'object' || value === null || !('urls' in value)) {
    return false;
  }
  const urls: unknown[] = Array.isArray(value.urls) ? value.urls : [value.urls];
  const validUrls =
    urls.length > 0 &&
    urls.every((url) => isFilled(url) && /^(stuns?|turns?):/i.test(url));
  if (!validUrls) return false;
  const isTurn = urls.some((url) => isFilled(url) && /^turns?:/i.test(url));
  return (
    !isTurn ||
    ('username' in value &&
      isFilled(value.username) &&
      'credential' in value &&
      isFilled(value.credential))
  );
};

// `ICE_SERVERS` holds a JSON `RTCIceServer[]`, which may list several TURN
// and STUN servers. Without it, the legacy single TURN and STUN keys apply.
const getIceServers = (callConfigs: Record<string, string>) => {
  if (callConfigs.ICE_SERVERS) {
    try {
      const parsed: unknown = JSON.parse(callConfigs.ICE_SERVERS);
      if (
        Array.isArray(parsed) &&
        parsed.length > 0 &&
        parsed.every(isIceServer)
      ) {
        return parsed;
      }
    } catch {
      // Malformed JSON falls back to the legacy keys below.
    }
  }

  const iceServers: RTCIceServer[] = [];
  if (callConfigs.TURN_SERVER_URL) {
    iceServers.push({
      urls: `turn:${callConfigs.TURN_SERVER_URL}`,
      username: callConfigs.TURN_SERVER_USERNAME,
      credential: callConfigs.TURN_SERVER_CREDENTIAL,
    });
  }
  if (callConfigs.STUN_SERVER_URL) {
    iceServers.push({ urls: `stun:${callConfigs.STUN_SERVER_URL}` });
  }
  return iceServers;
};

export const SipContainer = ({ children }: { children: React.ReactNode }) => {
  const callConfig = useAtomValue(callConfigAtom);

  const { callUserIntegrations, loading: callUserIntegrationLoading } =
    useCallUserIntegration();
  const { callConfigs, loading: callConfigLoading } = useCallGetConfigs({
    skip: callUserIntegrationLoading || Boolean(!callUserIntegrations?.length),
  });

  const iceServers = useMemo(() => getIceServers(callConfigs), [callConfigs]);

  const wsServer = callConfig?.wsServer;
  const operator = callConfig?.operators?.[0];
  const user = operator?.gsUsername ?? null;
  const password = operator?.gsPassword ?? undefined;

  const sipConfig = useMemo(() => {
    const [host = 'call.erxes.io', port = '8089'] = (wsServer || '').split(':');
    return {
      host,
      pathname: '/ws',
      user,
      password,
      port: Number.parseInt(port || '8089', 10),
      iceServers,
    };
  }, [wsServer, user, password, iceServers]);

  const hasCallConfig = callUserIntegrations?.some(
    (integration) =>
      !!callConfig?.inboxId && integration.inboxId === callConfig.inboxId,
  );

  // Hourly config polls must not unmount SipProvider, so only the first
  // load gates rendering.
  if (
    callUserIntegrationLoading ||
    (callConfigLoading && !Object.values(callConfigs).length) ||
    !callUserIntegrations?.length ||
    !Object.values(callConfigs).length
  ) {
    return null;
  }

  if (!callConfig?.inboxId || !hasCallConfig) {
    return <CallSelectConfig callUserIntegrations={callUserIntegrations} />;
  }

  if (!callConfig.isAvailable) {
    return null;
  }

  return (
    <SipProvider {...sipConfig}>
      <CallSessionBridge />
      {children}
    </SipProvider>
  );
};
