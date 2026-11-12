import type { ValidationStatus } from 'erxes-ui/types/ValidationStatus';

export interface IEmailField {
  email?: string;
  status?: ValidationStatus;
  isPrimary?: boolean;
}

export type TEmails = IEmailField[];

/** How records store emails: one primary with its status, then the others. */
export interface IEmailFieldProps {
  primaryEmail: string;
  emails: string[];
  /** Optional, as for phones: not every host tracks it. */
  emailValidationStatus?: ValidationStatus;
}

export type TEmailsOnValueChange = (values: Required<IEmailFieldProps>) => void;
