import { useSip } from '@/integrations/call/components/SipProvider';
import {
  callConfigAtom,
  sipStateAtom,
} from '@/integrations/call/states/sipStates';
import { IconPhone, IconPhoneEnd } from '@tabler/icons-react';
import { Button } from 'erxes-ui';
import { useAtom, useAtomValue } from 'jotai';
import {
  CallDirectionEnum,
  CallStatusEnum,
} from '@/integrations/call/types/sipTypes';
import { useEffect, useRef } from 'react';
import { getPluginAssetsUrl } from 'erxes-ui';
import { extractPhoneNumberFromCounterpart } from '@/integrations/call/utils/callUtils';
import { renderUserInfo } from '@/integrations/call/utils/renderUserInfo';

export const IncomingCallAudio = () => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const sip = useAtomValue(sipStateAtom);
  useEffect(() => {
    if (
      sip?.callStatus === CallStatusEnum.STARTING &&
      sip.callDirection === CallDirectionEnum.INCOMING
    ) {
      if (audioRef.current) {
        audioRef.current.src = getPluginAssetsUrl(
          'frontline',
          'sound/incoming.mp3',
        );
        audioRef.current.loop = true;
        audioRef.current.play().catch(() => {
          if (audioRef.current) {
            audioRef.current.src = '';
          }
        });
      }
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    }
  }, [sip?.callStatus, sip?.callDirection]);

  return <audio ref={audioRef} loop autoPlay />;
};

export const IncomingCall = ({
  addCustomer,
  customer,
  channels,
  loading,
}: {
  addCustomer: any;
  customer: any;
  channels: any;
  loading: boolean;
}) => {
  const sipState = useAtomValue(sipStateAtom);

  const phoneNumber = extractPhoneNumberFromCounterpart(
    sipState.callCounterpart || '',
  );
  const [callConfig] = useAtom(callConfigAtom);

  const { answerCall, stopCall } = useSip();

  useEffect(() => {
    if (phoneNumber) {
      addCustomer(callConfig?.inboxId || '', phoneNumber, sipState.groupName);
    }
  }, [phoneNumber]);

  const onAcceptCall = () => {
    if (answerCall && sipState?.callStatus !== CallStatusEnum.IDLE) {
      answerCall();
    }
  };

  const onDeclineCall = () => {
    if (stopCall) {
      stopCall();
    }
  };

  return (
    <>
      <div className="mt-2 px-3 pt-3 mb-1 space-y-2">
        {!loading && renderUserInfo(customer, null, phoneNumber)}
        <div className="text-center text-accent-foreground">
          Incoming call to{' '}
          <span className="font-semibold text-foreground">
            <span role="img" aria-label="flag-mn">
              🇲🇳
            </span>
            {channels && channels.length > 0 && (
              <div className="text-xs text-accent-foreground">
                {channels.map((channel: any, index: number) => (
                  <div key={index}>{channel.name}</div>
                ))}
              </div>
            )}
          </span>
        </div>
      </div>
      <div className="p-3 grid grid-cols-2 gap-2">
        <Button
          variant="secondary"
          className="text-destructive bg-destructive/10 hover:bg-destructive/15"
          onClick={onDeclineCall}
        >
          <IconPhoneEnd />
          Decline
        </Button>
        <Button
          variant="secondary"
          className="text-success bg-success/10 hover:bg-success/15"
          onClick={onAcceptCall}
        >
          <IconPhone />
          Answer
        </Button>
      </div>
    </>
  );
};
