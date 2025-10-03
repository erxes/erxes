import { useSip } from '@/integrations/call/components/SipProvider';
import { usePauseAgent } from '@/integrations/call/hooks/usePauseAgent';
import {
  callInfoAtom,
  sipStateAtom,
} from '@/integrations/call/states/sipStates';
import { SipStatusEnum } from '@/integrations/call/types/sipTypes';
import {
  IconPlayerPause,
  IconPlayerPlay,
  IconPower,
} from '@tabler/icons-react';
import { Badge, Button } from 'erxes-ui';
import { useAtomValue, useSetAtom } from 'jotai';

export const CallSipActions = () => {
  return (
    <div className="flex items-center gap-2">
      <SipStatusBadge />
      <SipPauseButton />
      <TurnOffButton />
    </div>
  );
};

export const TurnOffButton = () => {
  const sipState = useAtomValue(sipStateAtom);
  const setCallInfo = useSetAtom(callInfoAtom);
  const { unregisterSip, registerSip } = useSip();

  const isConnected = sipState?.sipStatus === SipStatusEnum.REGISTERED;

  const handleConnection = () => {
    isConnected ? unregisterSip() : registerSip();
    setCallInfo((prev) => ({
      ...prev,
      isUnregistered: isConnected,
    }));
  };

  return (
    <Button size="sm" variant="secondary" onClick={handleConnection}>
      <IconPower /> turn {isConnected ? 'off' : 'on'}
    </Button>
  );
};

export const SipPauseButton = () => {
  const { pauseAgent, loading, agentStatus } = usePauseAgent();
  const isPaused = agentStatus === 'pause';
  return (
    <Button
      size="sm"
      variant="outline"
      className="ml-auto"
      onClick={() => pauseAgent(isPaused ? 'unpause' : 'pause')}
      disabled={loading}
    >
      {isPaused ? <IconPlayerPlay /> : <IconPlayerPause />}
      {isPaused ? 'Unpause' : 'Pause'}
    </Button>
  );
};

export const SipStatusBadge = () => {
  const sipState = useAtomValue(sipStateAtom);

  const isConnected = sipState?.sipStatus === SipStatusEnum.REGISTERED;

  return (
    <Badge variant={isConnected ? 'success' : 'destructive'}>
      {isConnected ? 'Online' : 'Offline'}
    </Badge>
  );
};
