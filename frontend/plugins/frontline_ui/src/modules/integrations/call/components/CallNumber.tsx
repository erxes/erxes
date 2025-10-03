import { useAtomValue } from 'jotai';
import { sipStateAtom } from '@/integrations/call/states/sipStates';
import { extractPhoneNumberFromCounterpart } from '@/integrations/call/utils/callUtils';
import { formatPhoneNumber } from 'erxes-ui';

export const CallNumber = () => {
  const sip = useAtomValue(sipStateAtom);
  const phoneNumber = extractPhoneNumberFromCounterpart(
    sip.callCounterpart || '',
  );
  return (
    <div className="text-lg font-semibold text-primary text-center">
      {formatPhoneNumber({ value: phoneNumber, defaultCountry: 'MN' })}
    </div>
  );
};
