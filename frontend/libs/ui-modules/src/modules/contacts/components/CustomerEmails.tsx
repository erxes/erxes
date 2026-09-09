import {
  EmailDisplay,
  EmailListField,
  PopoverScoped,
  RecordTableInlineCell,
  TEmailsOnValueChange,
  ValidationStatus,
  toast,
} from 'erxes-ui';
import { useCustomerEdit } from 'ui-modules/modules/contacts/hooks';
import { useEffect, useRef, useState } from 'react';

interface CustomerEmailsProps {
  primaryEmail: string;
  _id: string;
  emailValidationStatus?: `${ValidationStatus}`;
  emails: string[];
  scope?: string;
  Trigger: React.ComponentType<{ children: React.ReactNode }>;
  onEmailClick?: (email: string) => void;
}

export function CustomerEmails({
  primaryEmail,
  _id,
  emailValidationStatus,
  emails,
  scope,
  Trigger,
  onEmailClick,
}: CustomerEmailsProps) {
  const { customerEdit } = useCustomerEdit();
  const [open, setOpen] = useState(false);
  const pendingClickRef = useRef<{
    email: string;
    timeoutId: number;
  } | null>(null);

  const emailProps = {
    primaryEmail,
    emails,
    emailValidationStatus: emailValidationStatus as ValidationStatus,
  };

  const handleValueChange: TEmailsOnValueChange = (values) => {
    customerEdit({
      variables: {
        _id,
        ...values,
      },
    });
  };

  const handleValidationStatusChange = (status: ValidationStatus) => {
    customerEdit({
      variables: {
        _id,
        emailValidationStatus: status,
      },
      onCompleted: () =>
        toast({
          title:
            status === ValidationStatus.Valid
              ? 'Email verified'
              : 'Email unverified',
          variant: 'success',
        }),
    });
  };

  const handleVerifiedEmailClick = (email: string) => {
    const pendingClick = pendingClickRef.current;

    if (pendingClick?.email === email) {
      window.clearTimeout(pendingClick.timeoutId);
      pendingClickRef.current = null;
      onEmailClick?.(email);
      return;
    }

    if (pendingClick) {
      window.clearTimeout(pendingClick.timeoutId);
    }

    pendingClickRef.current = {
      email,
      timeoutId: window.setTimeout(() => {
        pendingClickRef.current = null;
        setOpen(true);
      }, 300),
    };
  };

  useEffect(
    () => () => {
      if (pendingClickRef.current) {
        window.clearTimeout(pendingClickRef.current.timeoutId);
      }
    },
    [],
  );

  return (
    <PopoverScoped scope={scope || ''} modal open={open} onOpenChange={setOpen}>
      <Trigger>
        <EmailDisplay {...emailProps} onEmailClick={handleVerifiedEmailClick} />
      </Trigger>
      <RecordTableInlineCell.Content className="w-72">
        <EmailListField
          recordId={_id}
          {...emailProps}
          onValueChange={handleValueChange}
          onValidationStatusChange={handleValidationStatusChange}
        />
      </RecordTableInlineCell.Content>
    </PopoverScoped>
  );
}
