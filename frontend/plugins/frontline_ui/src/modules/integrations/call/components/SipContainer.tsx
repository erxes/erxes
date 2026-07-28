import { callConfigAtom } from '@/integrations/call/states/sipStates';
import { useAtom, useAtomValue } from 'jotai';
import SipProvider from './SipProvider';
import { useCallCreateSession } from '@/integrations/call/hooks/useCallCreateSession';
import { useCallUserIntegration } from '@/integrations/call/hooks/useCallUserIntegration';
import { useCallGetConfigs } from '@/integrations/call/hooks/useCallGetConfigs';
import { useCurrentCallSession } from '@/integrations/call/hooks/useCurrentCallSession';
import { CallSelectConfig } from '@/integrations/call/components/CallSelectConfig';
import { historyIdAtom } from '@/integrations/call/states/callStates';

const CallSessionBridge = () => {
  useCurrentCallSession();
  return null;
};

export const SipContainer = ({ children }: { children: React.ReactNode }) => {
  const [callConfig] = useAtom(callConfigAtom);
  const historyId = useAtomValue(historyIdAtom);

  const { callUserIntegrations, loading: callUserIntegrationLoading } =
    useCallUserIntegration();
  const { callConfigs, loading: callConfigLoading } = useCallGetConfigs();

  const { createActiveSession } = useCallCreateSession();

  if (
    callUserIntegrationLoading ||
    callConfigLoading ||
    !callUserIntegrations?.length ||
    !Object.values(callConfigs)?.length
  ) {
    return null;
  }
  if (!callConfig?.inboxId) {
    return <CallSelectConfig callUserIntegrations={callUserIntegrations} />;
  }

  if (!callConfig.isAvailable) {
    return null;
  }

  const { wsServer, operators } = callConfig;

  const [host = 'call.erxes.io', port = '8089'] =
    (wsServer || '').split(':') || [];

  const operator = operators?.[0];

  const sipConfig = {
    host,
    pathname: '/ws',
    user: operator?.gsUsername,
    password: operator?.gsPassword,
    port: Number.parseInt(port?.toString() || '8089', 10),
    iceServers: [
      {
        urls: `turn:${callConfigs.TURN_SERVER_URL}`,
        username: callConfigs.TURN_SERVER_USERNAME,
        credential: callConfigs.TURN_SERVER_CREDENTIAL,
      },
      {
        urls: `stun:${callConfigs.STUN_SERVER_URL}`,
      },
    ],
  };

  return (
    <SipProvider
      createSession={createActiveSession}
      historyId={historyId}
      {...sipConfig}
    >
      <CallSessionBridge />
      {children}
    </SipProvider>
  );
};
