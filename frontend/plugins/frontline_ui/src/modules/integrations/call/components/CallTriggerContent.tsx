import { useCallDuration } from '@/integrations/call/hooks/useCallDuration';
import { callWidgetOpenAtom } from '@/integrations/call/states/callWidgetOpenAtom';
import { sipStateAtom } from '@/integrations/call/states/sipStates';
import { CallStatusEnum } from '@/integrations/call/types/sipTypes';
import {
  IconPhoneFilled,
  IconPlayerStopFilled,
  IconX,
} from '@tabler/icons-react';
import { useAtomValue } from 'jotai';

export const CallTriggerContent = () => {
  const open = useAtomValue(callWidgetOpenAtom);
  const sip = useAtomValue(sipStateAtom);

  if (sip.callStatus === CallStatusEnum.ACTIVE) {
    return (
      <div className="flex flex-col items-center justify-center">
        <IconPlayerStopFilled className="text-destructive size-4" />
        <CallDuration />
      </div>
    );
  }

  return open ? <IconX /> : <IconPhoneFilled className="text-primary" />;
};

const CallDuration = () => {
  const time = useCallDuration();
  return (
    <div className="flex gap-1 font-medium leading-none text-xs">{time}</div>
  );
};
