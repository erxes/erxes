import { createContext } from 'react';
import { ValidationStatus } from 'erxes-ui/types';
import { TPhones } from '../components/PhoneField';

export const PhoneFieldsContext = createContext<{
  recordId: string;
  onValueChange?: (phones: TPhones) => void;
  onValidationStatusChange?: (status: ValidationStatus) => void;
}>({
  recordId: '',
  onValueChange: undefined,
  onValidationStatusChange: undefined,
});
