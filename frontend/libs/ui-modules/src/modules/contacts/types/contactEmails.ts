import type { TEmailsOnValueChange, ValidationStatus } from 'erxes-ui';
import type { Dispatch, SetStateAction } from 'react';
export type CompanyEmailsProps = {
  primaryEmail: string;
  _id: string;
  emails: string[];
  emailValidationStatus?: ValidationStatus;
  scope?: string;
  Trigger: React.ComponentType<{ children: React.ReactNode }>;
  onEmailClick?: (email: string) => void;
};

export interface CustomerEmailsProps {
  primaryEmail: string;
  _id: string;
  emailValidationStatus?: `${ValidationStatus}`;
  emails: string[];
  scope?: string;
  Trigger: React.ComponentType<{ children: React.ReactNode }>;
  onEmailClick?: (email: string) => void;
}

export type SendEmailButtonProps = {
  target?: ComposeEmailRequest;
  compact?: boolean;
};

export interface ComposeEmailRequest {
  email?: string;
  customerId?: string;
  companyId?: string;
  integrationId?: string;
}

export interface ComposeEmailActions {
  canComposeEmail: boolean;
  composeEmail: (target?: ComposeEmailRequest) => void;
}
export interface EmailDoubleClickState {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  handleEmailClick: (email: string) => void;
  handleEmailDoubleClick: (email: string) => void;
}
export interface ContactEmailsState extends EmailDoubleClickState {
  activateEmail?: (email: string) => void;
  emailProps: {
    primaryEmail: string;
    emails: string[];
    emailValidationStatus: ValidationStatus;
  };
  handleValueChange: TEmailsOnValueChange;
  handleValidationStatusChange: (status: ValidationStatus) => void;
}
export interface CustomerEmailsState
  extends Omit<
    ContactEmailsState,
    'handleEmailClick' | 'handleEmailDoubleClick'
  > {
  handleVerifiedEmailClick: (email: string) => void;
  handleVerifiedEmailDoubleClick: (email: string) => void;
}
