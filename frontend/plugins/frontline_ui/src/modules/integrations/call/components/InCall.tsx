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
  IconUser,
} from '@tabler/icons-react';
import { Button, ButtonProps, cn } from 'erxes-ui';
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

export const InCall = ({
  customer,
  channels,
  loading,
}: {
  customer: any;
  channels: any;
  loading: boolean;
}) => {
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
        <TransferTrigger />
        <Detail />
        <KeypadTrigger />
        <SelectCustomer />
      </div>
      <div className="px-3 pb-6">
        <Button
          className="w-full bg-destructive/10 text-destructive hover:bg-destructive/15"
          variant="secondary"
          onClick={stopCall}
        >
          End Call
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
      {isMutedState ? 'Unmute' : 'Mute'}
    </InCallActionButton>
  );
};

export const Detail = () => {
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
      Detail
    </InCallActionButton>
  );
};

export const KeypadTrigger = () => {
  return (
    <InCallActionButton>
      <IconDialpad />
      Keypad
    </InCallActionButton>
  );
};

export const SelectCustomer = () => {
  return (
    <InCallActionButton>
      <IconUser />
      Select <br /> Customer
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
        {sip.callStatus === CallStatusEnum.STARTING && 'Calling...'}
        {sip.callStatus === CallStatusEnum.ACTIVE && 'In call'}
      </div>
      {!loading && renderUserInfo(customer, customerDetail, phoneNumber)}

      {sip.callStatus === CallStatusEnum.ACTIVE && (
        <div className="text-center text-accent-foreground text-sm">
          Duration: {time}
        </div>
      )}
    </>
  );
};
