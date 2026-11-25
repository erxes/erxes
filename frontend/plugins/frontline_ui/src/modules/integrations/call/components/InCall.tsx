import { sipStateAtom } from '@/integrations/call/states/sipStates';
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
import { useAtomValue, useSetAtom } from 'jotai';
import React, { useState } from 'react';
import { useSip } from '@/integrations/call/components/SipProvider';
import {
  Transfer,
  TransferTrigger,
} from '@/integrations/call/components/CallTransfer';
import { useNavigate } from 'react-router-dom';
import { currentCallConversationIdAtom } from '@/integrations/call/states/callStates';
import { useCallDuration } from '@/integrations/call/hooks/useCallDuration';
import { refetchNewMessagesState } from '@/inbox/conversations/states/newMessagesCountState';
import { ICallChannels, ICustomer } from '@/integrations/call/types/callTypes';
import type { CallsCustomerDetailQuery } from '~/gql/graphql';
import { renderUserInfo } from '@/integrations/call/utils/renderUserInfo';
import { extractPhoneNumberFromCounterpart } from '@/integrations/call/utils/callUtils';
import { useCustomerDetail } from '@/integrations/call/hooks/useCustomerDetail';
import { useTranslation } from 'react-i18next';

export const InCall = ({
  customer,
  channels,
  loading,
}: {
  customer: Partial<ICustomer>;
  channels: ICallChannels | undefined;
  loading: boolean;
}) => {
  const { t } = useTranslation('frontline', {
    keyPrefix: 'modules.integrations',
  });
  const sipState = useAtomValue(sipStateAtom);

  const phoneNumber = extractPhoneNumberFromCounterpart(
    sipState.callCounterpart || '',
  );
  const { customerDetail } = useCustomerDetail({
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
  const { t } = useTranslation('frontline', {
    keyPrefix: 'modules.integrations',
  });
  const { mute, muted, unmute } = useSip();
  return (
    <InCallActionButton
      onClick={muted ? unmute : mute}
      className={cn(muted && 'text-destructive hover:text-destructive')}
    >
      {muted ? <IconMicrophoneOff /> : <IconMicrophone />}
      {muted ? t('unmute') : t('mute')}
    </InCallActionButton>
  );
};

export const Detail = () => {
  const { t } = useTranslation('frontline', {
    keyPrefix: 'modules.integrations',
  });
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
  const { t } = useTranslation('frontline', {
    keyPrefix: 'modules.integrations',
  });
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
  const { t } = useTranslation('frontline', {
    keyPrefix: 'modules.integrations',
  });
  const { hold, unhold, held } = useSip();
  const sip = useAtomValue(sipStateAtom);

  return (
    <InCallActionButton
      onClick={held ? unhold : hold}
      disabled={sip.callStatus !== CallStatusEnum.ACTIVE}
      className={cn(held && 'text-warning hover:text-warning')}
    >
      {held ? <IconPlayerPlay /> : <IconPlayerPause />}
      {held ? t('unhold') : t('hold')}
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
  customerDetail: CallsCustomerDetailQuery['callsCustomerDetail'] | undefined;
  customer: Partial<ICustomer>;
  channels: ICallChannels | undefined;
  phoneNumber: string;
  loading: boolean;
}) => {
  const { t } = useTranslation('frontline', {
    keyPrefix: 'modules.integrations',
  });
  const sip = useAtomValue(sipStateAtom);
  const time = useCallDuration();

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
