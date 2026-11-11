import { createContext } from 'react';
import { TEmails } from '../components/EmailField';
import { ValidationStatus } from 'erxes-ui/types';

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
