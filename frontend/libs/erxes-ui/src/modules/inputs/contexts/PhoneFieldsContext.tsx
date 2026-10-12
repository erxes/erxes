import { createContext } from 'react';
import { TPhones } from '../components/PhoneField';
import { ValidationStatus } from 'erxes-ui/types';

export const PhoneFieldsContext = createContext<{
  recordId: string;
  onValueChange?: (phones: TPhones) => void;
  onValidationStatusChange?: (status: ValidationStatus) => void;
}>({
  recordId: '',
  onValueChange: undefined,
  onValidationStatusChange: undefined,
});
