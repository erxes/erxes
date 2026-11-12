import type { ValidationStatus } from 'erxes-ui/types/ValidationStatus';

export interface IPhoneField {
  phone?: string;
  status?: ValidationStatus;
  isPrimary?: boolean;
}

export type TPhones = IPhoneField[];

/** How records store phones: one primary with its status, then the others. */
export interface IPhoneFieldProps {
  primaryPhone: string;
  phones: string[];
  phoneValidationStatus?: ValidationStatus;
}
