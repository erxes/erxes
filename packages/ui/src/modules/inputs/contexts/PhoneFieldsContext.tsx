import { createContext, useContext } from 'react';
import type { ValidationStatus } from 'erxes-ui/types/ValidationStatus';
import type { TPhones } from '../types/phoneField';

type PhoneFieldsContextValue = {
  phones: TPhones;
  onValueChange: (phones: TPhones) => void;
  onValidationStatusChange?: (status: ValidationStatus) => void;
  /** The input shows while adding or editing, and always when there is no phone yet. */
  showInput: boolean;
  openInput: () => void;
  editingPhone: string | null;
  startEditing: (phone: string) => void;
  closeInput: () => void;
};

export const PhoneFieldsContext = createContext<PhoneFieldsContextValue | null>(null);

export const usePhoneFields = () => {
  const context = useContext(PhoneFieldsContext);

  if (!context) {
    throw new Error('usePhoneFields must be used within PhoneField.');
  }

  return context;
};
