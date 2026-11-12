import { createContext } from 'react';
import type { ValidationStatus } from 'erxes-ui/types/ValidationStatus';
import type { TPhones } from '../components/PhoneField';

export const PhoneFieldsContext = createContext<{
  recordId: string;
  onValueChange?: (phones: TPhones) => void;
  onValidationStatusChange?: (status: ValidationStatus) => void;
}>({
  recordId: '',
  onValueChange: undefined,
  onValidationStatusChange: undefined,
});
