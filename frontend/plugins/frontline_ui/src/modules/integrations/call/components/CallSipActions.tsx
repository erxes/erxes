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
  IconRefresh,
} from '@tabler/icons-react';
import { Badge, Button, Tooltip } from 'erxes-ui';
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
  const { unregisterSip, registerSip, reconnectSip } = useSip();

  const isRegistered = sipState?.sipStatus === SipStatusEnum.REGISTERED;
  const canRegister = sipState?.sipStatus === SipStatusEnum.CONNECTED;
  const needsReconnect =
    sipState?.sipStatus === SipStatusEnum.ERROR ||
    sipState?.sipStatus === SipStatusEnum.DISCONNECTED;

  const handleConnection = () => {
    if (isRegistered) {
      unregisterSip();
      setCallInfo((prev) => ({ ...prev, isUnregistered: true }));
    } else if (canRegister) {
      registerSip();
      setCallInfo((prev) => ({ ...prev, isUnregistered: false }));
    }
  };

  if (needsReconnect) {
    return (
      <Button
        size="sm"
        variant="secondary"
        onClick={() => {
          setCallInfo((prev) => ({ ...prev, isUnregistered: false }));
          reconnectSip();
        }}
      >
        <IconRefresh /> {t('reconnect')}
      </Button>
    );
  }

  return (
    <Button
      size="sm"
      variant="secondary"
      onClick={handleConnection}
      disabled={!isRegistered && !canRegister}
    >
      <IconPower /> {isRegistered ? t('turn-off') : t('turn-on')}
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
  const callInfo = useAtomValue(callInfoAtom);
  const { sipStatus, sipErrorMessage } = sipState || {};

  const isManuallyTurnedOff =
    sipStatus === SipStatusEnum.CONNECTED && callInfo?.isUnregistered;

  if (
    !isManuallyTurnedOff &&
    (sipStatus === SipStatusEnum.CONNECTING ||
      sipStatus === SipStatusEnum.CONNECTED)
  ) {
    return <Badge variant="warning">{t('connecting')}</Badge>;
  }

  if (sipStatus === SipStatusEnum.ERROR) {
    return (
      <Tooltip.Provider>
        <Tooltip>
          <Tooltip.Trigger asChild>
            <Badge variant="destructive">{t('connection-error')}</Badge>
          </Tooltip.Trigger>
          {sipErrorMessage && (
            <Tooltip.Content>{sipErrorMessage}</Tooltip.Content>
          )}
        </Tooltip>
      </Tooltip.Provider>
    );
  }

  const isConnected = sipStatus === SipStatusEnum.REGISTERED;

  return (
    <Badge variant={isConnected ? 'success' : 'destructive'}>
      {isConnected ? t('online') : t('offline')}
    </Badge>
  );
};
