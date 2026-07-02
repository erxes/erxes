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
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation('frontline');
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
      <IconPower /> {isConnected ? t('turn-off') : t('turn-on')}
    </Button>
  );
};

export const SipPauseButton = () => {
  const { t } = useTranslation('frontline');
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
      {isPaused ? t('unpause') : t('pause')}
    </Button>
  );
};

export const SipStatusBadge = () => {
  const { t } = useTranslation('frontline');
  const sipState = useAtomValue(sipStateAtom);

  const isConnected = sipState?.sipStatus === SipStatusEnum.REGISTERED;

  return (
    <Badge variant={isConnected ? 'success' : 'destructive'}>
      {isConnected ? t('online') : t('offline')}
    </Badge>
  );
};
