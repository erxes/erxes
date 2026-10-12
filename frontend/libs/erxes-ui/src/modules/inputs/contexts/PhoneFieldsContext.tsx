import { createContext } from 'react';
import { IPhoneStatus, TPhones } from '../components/PhoneField';

export const PhoneFieldsContext = createContext<{
  recordId: string;
  onValueChange?: (phones: TPhones) => void;
  onValidationStatusChange?: (status: IPhoneStatus) => void;
}>({
  recordId: '',
  onValueChange: undefined,
  onValidationStatusChange: undefined,
});
