import { callDurationAtom } from '@/integrations/call/states/callStates';
import { differenceInSeconds } from 'date-fns';
import { useAtomValue } from 'jotai';
import { useEffect, useState } from 'react';

export const useCallDuration = () => {
  const startDate = useAtomValue(callDurationAtom);
  return useCallDurationFromDate(startDate);
};

export const useCallDurationFromDate = (date: Date | null) => {
  const [time, setTime] = useState('00:00');

  useEffect(() => {
    if (!date) {
      setTime('00:00');
      return;
    }
    const update = () => {
      const total = Math.max(0, differenceInSeconds(new Date(), date));
      const minutes = String(Math.floor(total / 60)).padStart(2, '0');
      const seconds = String(total % 60).padStart(2, '0');
      setTime(`${minutes}:${seconds}`);
    };
    update(); // no 1s initial lag
    const interval = setInterval(update, 1000);

    return () => clearInterval(interval);
  }, [date]);

  return time;
};
