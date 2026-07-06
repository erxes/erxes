import {
  rtcSessionAtom,
  sipStateAtom,
} from '@/integrations/call/states/sipStates';
import { CallStatusEnum } from '@/integrations/call/types/sipTypes';
import {
  IconDialpad,
  IconFileText,
  IconMicrophone,
  IconMicrophoneOff,
  IconPlayerPause,
  IconPlayerPlay,
} from '@tabler/icons-react';
import { Button, ButtonProps, cn, Popover } from 'erxes-ui';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import React, { useEffect, useState } from 'react';
import { useSip } from '@/integrations/call/components/SipProvider';
import {
  Transfer,
  TransferTrigger,
} from '@/integrations/call/components/CallTransfer';
import { useNavigate } from 'react-router-dom';
import {
  callDurationAtom,
  currentCallConversationIdAtom,
} from '@/integrations/call/states/callStates';
import { useCallDuration } from '@/integrations/call/hooks/useCallDuration';
import { refetchNewMessagesState } from '@/inbox/conversations/states/newMessagesCountState';
import { ICustomer } from '@/integrations/call/types/callTypes';
import { renderUserInfo } from '@/integrations/call/utils/renderUserInfo';
import { extractPhoneNumberFromCounterpart } from '@/integrations/call/utils/callUtils';
import { useCustomerDetail } from '@/integrations/call/hooks/useCustomerDetail';
import { useTranslation } from 'react-i18next';

export const InCall = ({
  customer,
  channels,
  loading,
}: {
  customer: any;
  channels: any;
  loading: boolean;
}) => {
  const { t } = useTranslation('frontline');
  const sipState = useAtomValue(sipStateAtom);

  const phoneNumber = extractPhoneNumberFromCounterpart(
    sipState.callCounterpart || '',
  );
  const { customerDetail, loading: CallLoading } = useCustomerDetail({
    phoneNumber,
  });

  const { stopCall } = useSip();

  return (
    <>
      <div className="text-center space-y-2 px-2 py-6">
        <CallInfo
          customer={customer}
          channels={channels}
          loading={loading}
          customerDetail={customerDetail}
          phoneNumber={phoneNumber}
        />
      </div>
      <Transfer />
      <div className="grid grid-cols-5 p-1 gap-1 items-stretch border-b-0">
        <Mute />
        <Hold />
        <TransferTrigger />
        <Detail />
        <KeypadTrigger />
      </div>
      <div className="px-3 pb-6">
        <Button
          className="w-full bg-destructive/10 text-destructive hover:bg-destructive/15"
          variant="secondary"
          onClick={stopCall}
        >
          {t('end-call')}
        </Button>
      </div>
    </>
  );
};

export const InCallActionButton = React.forwardRef<
  HTMLButtonElement,
  ButtonProps
>(({ className, ...props }, ref) => {
  return (
    <Button
      ref={ref}
      variant="ghost"
      className={cn(
        'flex-col h-auto text-accent-foreground hover:text-foreground font-medium [&>svg]:size-5 gap-1 rounded-lg justify-start text-wrap px-1 text-xs',
        className,
      )}
      {...props}
    />
  );
});

export const Mute = () => {
  const { t } = useTranslation('frontline');
  const { mute, isMuted, unmute } = useSip();
  const [isMutedState, setIsMutedState] = useState(isMuted());
  const [checkIsMuted, setCheckIsMuted] = useState(false);
  const handleClick = () => {
    if (isMuted()) {
      unmute();
    } else {
      mute();
    }
    setCheckIsMuted(true);
  };

  useEffect(() => {
    if (checkIsMuted) {
      setIsMutedState(isMuted());
      setCheckIsMuted(false);
    }
  }, [checkIsMuted, isMuted]);
  return (
    <InCallActionButton
      onClick={handleClick}
      className={cn(isMutedState && 'text-destructive hover:text-destructive')}
    >
      {isMutedState ? <IconMicrophoneOff /> : <IconMicrophone />}
      {isMutedState ? t('unmute') : t('mute')}
    </InCallActionButton>
  );
};

export const Detail = () => {
  const { t } = useTranslation('frontline');
  const sip = useAtomValue(sipStateAtom);
  const currentCallConversationId = useAtomValue(currentCallConversationIdAtom);
  const setRefetchNewMessages = useSetAtom(refetchNewMessagesState);
  const navigate = useNavigate();

  return (
    <InCallActionButton
      disabled={
        sip.callStatus !== CallStatusEnum.ACTIVE || !currentCallConversationId
      }
      onClick={() => {
        if (sip.callStatus === CallStatusEnum.ACTIVE) {
          navigate(
            `/frontline/inbox?conversationId=${currentCallConversationId}`,
          );
          setRefetchNewMessages(true);
        }
      }}
    >
      <IconFileText />
      {t('detail')}
    </InCallActionButton>
  );
};

const DTMF_KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'];

export const KeypadTrigger = () => {
  const { t } = useTranslation('frontline');
  const { sendDtmf } = useSip();
  const sip = useAtomValue(sipStateAtom);
  const [sentTones, setSentTones] = useState('');

  const handleKey = (key: string) => {
    sendDtmf(key);
    setSentTones((prev) => (prev + key).slice(-20));
  };

  return (
    <Popover onOpenChange={(open) => !open && setSentTones('')}>
      <Popover.Trigger asChild>
        <InCallActionButton disabled={sip.callStatus !== CallStatusEnum.ACTIVE}>
          <IconDialpad />
          {t('keypad')}
        </InCallActionButton>
      </Popover.Trigger>
      <Popover.Content className="w-48 p-2" align="center">
        <div className="h-7 mb-1 text-center font-medium leading-7 tracking-widest truncate">
          {sentTones}
        </div>
        <div className="grid grid-cols-3 gap-1">
          {DTMF_KEYS.map((key) => (
            <Button
              key={key}
              variant="secondary"
              className="h-9 text-base font-semibold"
              onClick={() => handleKey(key)}
            >
              {key}
            </Button>
          ))}
        </div>
      </Popover.Content>
    </Popover>
  );
};

export const Hold = () => {
  const { t } = useTranslation('frontline');
  const { hold, unhold, isHeld } = useSip();
  const sip = useAtomValue(sipStateAtom);
  const [isHeldState, setIsHeldState] = useState(!!isHeld().localHold);

  const handleClick = () => {
    if (isHeld().localHold) {
      unhold();
    } else {
      hold();
    }
    setTimeout(() => setIsHeldState(!!isHeld().localHold), 100);
  };

  return (
    <InCallActionButton
      onClick={handleClick}
      disabled={sip.callStatus !== CallStatusEnum.ACTIVE}
      className={cn(isHeldState && 'text-warning hover:text-warning')}
    >
      {isHeldState ? <IconPlayerPlay /> : <IconPlayerPause />}
      {isHeldState ? t('unhold') : t('hold')}
    </InCallActionButton>
  );
};

const CallInfo = ({
  customerDetail,
  customer,
  channels,
  phoneNumber,
  loading,
}: {
  customerDetail: any;
  customer: ICustomer;
  channels: any;
  phoneNumber: string;
  loading: boolean;
}) => {
  const { t } = useTranslation('frontline');
  const sip = useAtomValue(sipStateAtom);
  const setStartDate = useSetAtom(callDurationAtom);
  const time = useCallDuration();
  const [rtcSessionState] = useAtom(rtcSessionAtom);

  useEffect(() => {
    if (sip.callStatus === CallStatusEnum.ACTIVE) {
      setStartDate(rtcSessionState?.start_time || new Date());
    } else {
      setStartDate(null);
    }
  }, [setStartDate, sip.callStatus]);

  return (
    <>
      <div className="text-accent-foreground text-sm text-center font-medium">
        {sip.callStatus === CallStatusEnum.STARTING && t('calling')}
        {sip.callStatus === CallStatusEnum.ACTIVE && t('in-call')}
      </div>
      {!loading && renderUserInfo(customer, customerDetail, phoneNumber)}

      {sip.callStatus === CallStatusEnum.ACTIVE && (
        <div className="text-center text-accent-foreground text-sm">
          {t('duration')}: {time}
        </div>
      )}
    </>
  );
};
