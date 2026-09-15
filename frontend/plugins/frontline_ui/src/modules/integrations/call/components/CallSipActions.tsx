import { useSip } from '@/integrations/call/components/SipProvider';
import { usePauseAgent } from '@/integrations/call/hooks/usePauseAgent';
import { historyIdAtom } from '@/integrations/call/states/callStates';
import { callSelectConfigDialogAtom } from '@/integrations/call/states/callSelectConfigDialogAtom';
import { callWidgetOpenAtom } from '@/integrations/call/states/callWidgetOpenAtom';
import { callWidgetPositionState } from '@/integrations/call/states/callWidgetStates';
import {
  callConfigAtom,
  callInfoAtom,
  sipStateAtom,
} from '@/integrations/call/states/sipStates';
import { SipStatusEnum } from '@/integrations/call/types/sipTypes';
import {
  IconEraser,
  IconPlayerPause,
  IconPlayerPlay,
  IconPower,
  IconRefresh,
} from '@tabler/icons-react';
import { Badge, Button, toast, Tooltip, useConfirm } from 'erxes-ui';
import { useAtomValue, useSetAtom } from 'jotai';
import { RESET } from 'jotai/utils';
import { useTranslation } from 'react-i18next';

export const CallSipActions = () => {
  return (
    <div className="flex items-center gap-2">
      <SipStatusBadge />
      <SipPauseButton />
      <TurnOffButton />
      <ClearCallCacheButton />
    </div>
  );
};

export const ClearCallCacheButton = () => {
  const { t } = useTranslation('frontline');
  const { confirm } = useConfirm();
  const setCallConfig = useSetAtom(callConfigAtom);
  const setCallInfo = useSetAtom(callInfoAtom);
  const setHistoryId = useSetAtom(historyIdAtom);
  const setWidgetPosition = useSetAtom(callWidgetPositionState);
  const setWidgetOpen = useSetAtom(callWidgetOpenAtom);
  const setSelectConfigDialogOpen = useSetAtom(callSelectConfigDialogAtom);

  const clearCache = () => {
    setWidgetOpen(false);
    setCallInfo(RESET);
    setHistoryId(RESET);
    setWidgetPosition(RESET);
    setSelectConfigDialogOpen(true);
    setCallConfig(RESET);
    toast({
      title: t('call-cache-cleared', 'Call cache cleared'),
      variant: 'success',
    });
  };

  const handleClick = () =>
    confirm({
      message: t('confirm-clear-call-cache', 'Clear call cache?'),
      options: {
        description: t(
          'confirm-clear-call-cache-description',
          'The phone will disconnect and you will need to select a call config again.',
        ),
        okLabel: t('clear-cache', 'Clear cache'),
        cancelLabel: t('cancel', 'Cancel'),
      },
    }).then(clearCache);

  return (
    <Tooltip.Provider>
      <Tooltip>
        <Tooltip.Trigger asChild>
          <Button
            size="sm"
            variant="secondary"
            className="w-6 px-0"
            aria-label={t('clear-cache', 'Clear cache')}
            onClick={handleClick}
          >
            <IconEraser />
          </Button>
        </Tooltip.Trigger>
        <Tooltip.Content>{t('clear-cache', 'Clear cache')}</Tooltip.Content>
      </Tooltip>
    </Tooltip.Provider>
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
