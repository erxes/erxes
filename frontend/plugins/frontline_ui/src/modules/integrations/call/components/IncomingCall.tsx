import { useSip } from '@/integrations/call/components/SipProvider';
import {
  callConfigAtom,
  sipStateAtom,
} from '@/integrations/call/states/sipStates';
import {
  CallDirectionEnum,
  CallStatusEnum,
} from '@/integrations/call/types/sipTypes';
import { extractPhoneNumberFromCounterpart } from '@/integrations/call/utils/callUtils';
import { renderUserInfo } from '@/integrations/call/utils/renderUserInfo';
import { IconPhone, IconPhoneEnd } from '@tabler/icons-react';
import { Button, getPluginAssetsUrl, toast } from 'erxes-ui';
import { useAtomValue } from 'jotai';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { TAddCallCustomer } from '@/integrations/call/hooks/useAddCustomer';
import { ICustomer } from '@/integrations/call/types/callTypes';

export const IncomingCallAudio = () => {
  const { t } = useTranslation('frontline', {
    keyPrefix: 'modules.integrations',
  });
  const audioRef = useRef<HTMLAudioElement>(null);
  const tRef = useRef(t);
  tRef.current = t;
  const sip = useAtomValue(sipStateAtom);
  const ringing =
    sip?.callStatus === CallStatusEnum.STARTING &&
    sip.callDirection === CallDirectionEnum.INCOMING;

  useEffect(() => {
    const audio = audioRef.current;
    if (!ringing || !audio) return;

    let cancelled = false;
    audio.src = getPluginAssetsUrl('frontline', 'sound/incoming.mp3');
    audio.loop = true;
    audio.play().catch((err) => {
      // A pause() from the cleanup also rejects play(); only a browser
      // autoplay block is worth telling the user about.
      if (cancelled || err?.name !== 'NotAllowedError') return;
      toast({
        title: tRef.current('ringtone-blocked'),
        variant: 'warning',
      });
    });

    return () => {
      cancelled = true;
      audio.pause();
      audio.removeAttribute('src');
      audio.load();
    };
  }, [ringing]);

  return <audio ref={audioRef} loop />;
};

export const IncomingCall = ({
  addCustomer,
  customer,
  integrationName,
  loading,
}: {
  addCustomer: TAddCallCustomer;
  customer: Partial<ICustomer>;
  integrationName: string;
  loading: boolean;
}) => {
  const { t } = useTranslation('frontline', {
    keyPrefix: 'modules.integrations',
  });
  const sipState = useAtomValue(sipStateAtom);

  const phoneNumber = extractPhoneNumberFromCounterpart(
    sipState.callCounterpart || '',
  );
  const callConfig = useAtomValue(callConfigAtom);

  const { answerCall, answering, stopCall } = useSip();
  const inboxId = callConfig?.inboxId;
  const { groupName } = sipState;

  useEffect(() => {
    if (phoneNumber) {
      addCustomer(inboxId || '', phoneNumber, groupName);
    }
  }, [phoneNumber, inboxId, groupName, addCustomer]);

  return (
    <>
      <div className="mt-2 px-3 pt-3 mb-1 space-y-2">
        {!loading && renderUserInfo(customer, null, phoneNumber)}
        <div className="text-center text-accent-foreground">
          {t('incoming-call-to')}{' '}
          <span className="font-semibold text-foreground">
            {integrationName && (
              <div className="text-xs text-accent-foreground">
                {integrationName}
              </div>
            )}
          </span>
        </div>
      </div>
      <div className="p-3 grid grid-cols-2 gap-2">
        <Button
          variant="secondary"
          className="text-destructive bg-destructive/10 hover:bg-destructive/15"
          onClick={stopCall}
        >
          <IconPhoneEnd />
          {t('decline')}
        </Button>
        <Button
          variant="secondary"
          className="text-success bg-success/10 hover:bg-success/15"
          onClick={answerCall}
          disabled={answering}
        >
          <IconPhone />
          {t('answer')}
        </Button>
      </div>
    </>
  );
};
