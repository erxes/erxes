import { useAutoAnimate } from '@formkit/auto-animate/react';
import { formatEmails } from 'erxes-ui/modules/display/utils/formatEmails';
import { ValidationStatus } from 'erxes-ui/types/ValidationStatus';
import { useContactFieldInput, type ContactFieldInput } from '../hooks/useContactFieldInput';
import type {
  IEmailField,
  IEmailFieldProps,
  TEmails,
  TEmailsOnValueChange,
} from '../types/emailField';
import { ContactFieldOptions, ContactFieldValue } from './ContactFieldParts';
import { EmailFieldForm } from './EmailFieldForm';

type EmailListProps = {
  emails: TEmails;
  onValueChange: (emails: TEmails) => void;
  onValidationStatusChange?: (status: ValidationStatus) => void;
  noValidation?: boolean;
  input: ContactFieldInput;
};

const EmailRow = ({
  item,
  emails,
  onValueChange,
  onValidationStatusChange,
  noValidation,
  input,
}: EmailListProps & { item: IEmailField }) => {
  const others = emails.filter((other) => other.email !== item.email);

  return (
    <div className="flex items-center overflow-hidden gap-1 w-full">
      <ContactFieldValue text={item.email ?? ''} status={item.status} isPrimary={item.isPrimary} />
      <ContactFieldOptions
        kind="email"
        isPrimary={item.isPrimary}
        status={item.status}
        showVerification={!noValidation}
        onSetPrimary={() =>
          onValueChange([
            { ...item, isPrimary: true },
            ...others.map((other) => ({ ...other, isPrimary: false })),
          ])
        }
        onEdit={() => input.startEditing(item.email ?? '')}
        onDelete={() => onValueChange(others)}
        onStatusChange={(status) => onValidationStatusChange?.(status)}
      />
    </div>
  );
};

const EmailList = (props: EmailListProps) => {
  const [animationParent] = useAutoAnimate();

  if (props.emails.length === 0) {
    return <div className="pt-1" />;
  }

  return (
    <div ref={animationParent} className="space-y-1 p-1">
      {props.emails.map(
        (item) => item.email && <EmailRow key={item.email} item={item} {...props} />,
      )}
    </div>
  );
};

/** Back to the stored shape: the primary email and its status, then the other addresses. */
const toEmailFieldProps = (values: TEmails): Required<IEmailFieldProps> => {
  const primary = values.find((item) => item.isPrimary);

  return {
    primaryEmail: primary?.email ?? '',
    emails: values.flatMap((item) => (!item.isPrimary && item.email ? [item.email] : [])),
    emailValidationStatus: primary?.status ?? ValidationStatus.Invalid,
  };
};

const EmailFieldBody = ({ emails, ...props }: Omit<EmailListProps, 'input'>) => {
  const input = useContactFieldInput(emails.some((item) => item.email));

  return (
    <>
      <EmailList emails={emails} input={input} {...props} />
      <EmailFieldForm
        key={input.editing ?? ''}
        emails={emails}
        onValueChange={props.onValueChange}
        input={input}
      />
    </>
  );
};

/** A record's emails: the list with a menu per email, and an input to add or edit one. */
export const EmailListField = ({
  recordId,
  onValueChange,
  onValidationStatusChange,
  noValidation,
  primaryEmail,
  emails,
  emailValidationStatus,
}: IEmailFieldProps & {
  /** The record the emails belong to; another record starts with the input closed. */
  recordId: string;
  onValueChange: TEmailsOnValueChange;
  onValidationStatusChange?: (status: ValidationStatus) => void;
  /** Hides the verified/unverified choice. */
  noValidation?: boolean;
}) => (
  <EmailFieldBody
    key={recordId}
    emails={formatEmails(primaryEmail, emails, emailValidationStatus)}
    onValueChange={(values) => onValueChange(toEmailFieldProps(values))}
    onValidationStatusChange={onValidationStatusChange}
    noValidation={noValidation}
  />
);
