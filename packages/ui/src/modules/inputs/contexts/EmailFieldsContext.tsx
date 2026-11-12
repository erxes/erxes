import { createContext } from 'react';
import type { TEmails } from '../components/EmailField';
import type { ValidationStatus } from 'erxes-ui/types/ValidationStatus';

export const EmailFieldsContext = createContext<{
  recordId: string;
  onValueChange?: (emails: TEmails) => void;
  noValidation?: boolean;
  onValidationStatusChange?: (status: ValidationStatus) => void;
}>({
  recordId: '',
  onValueChange: undefined,
  noValidation: false,
  onValidationStatusChange: undefined,
});
