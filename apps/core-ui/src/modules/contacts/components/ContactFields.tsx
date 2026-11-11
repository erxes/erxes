import {
  EmailDisplay,
  EmailListField,
  FullNameField,
  PhoneDisplay,
  PhoneField,
  PopoverScoped,
  RecordTableInlineCell,
} from 'erxes-ui';
import { type ComponentType, type ReactNode, useState } from 'react';

/*
 * Old ui-modules CustomerName / CustomerEmails / CustomerPhones (and the
 * company ones), with the save handed in: the same cells serve customers and
 * companies, in the list and in the side panel.
 */

type TTrigger = ComponentType<{ children: ReactNode }>;

/** A customer's first and last name, edited in place. */
export const ContactName = ({
  firstName,
  lastName,
  scope,
  onSave,
  children,
}: {
  firstName?: string | null;
  lastName?: string | null;
  scope: string;
  onSave: (firstName: string, lastName: string) => void;
  children?: ReactNode;
}) => (
  <FullNameField
    firstName={firstName ?? ''}
    lastName={lastName ?? ''}
    scope={scope}
    onValueChange={(nextFirstName, nextLastName) => {
      if (nextFirstName !== (firstName ?? '') || nextLastName !== (lastName ?? '')) {
        onSave(nextFirstName, nextLastName);
      }
    }}
  >
    {children}
  </FullNameField>
);

/** Emails: the primary first; click to add, remove or make primary. */
export const ContactEmails = ({
  id,
  primaryEmail,
  emails,
  maxVisible,
  scope,
  Trigger,
  onSave,
}: {
  id: string;
  primaryEmail?: string | null;
  emails: string[];
  maxVisible?: number;
  scope?: string;
  Trigger: TTrigger;
  onSave: (value: { primaryEmail: string | null; emails: string[] }) => void;
}) => {
  const [open, setOpen] = useState(false);
  const emailProps = { primaryEmail: primaryEmail ?? '', emails };

  return (
    <PopoverScoped scope={scope || ''} modal open={open} onOpenChange={setOpen}>
      <div className="flex min-w-0 items-center">
        <Trigger>
          <EmailDisplay maxVisible={maxVisible} {...emailProps} />
        </Trigger>
      </div>
      <RecordTableInlineCell.Content className="w-72">
        <EmailListField
          recordId={id}
          {...emailProps}
          noValidation
          onValueChange={(next) => onSave({ primaryEmail: next.primaryEmail || null, emails: next.emails ?? [] })}
        />
      </RecordTableInlineCell.Content>
    </PopoverScoped>
  );
};

/** Phones: the primary first; click to add, remove or make primary. */
export const ContactPhones = ({
  id,
  primaryPhone,
  phones,
  maxVisible,
  scope,
  Trigger,
  onSave,
}: {
  id: string;
  primaryPhone?: string | null;
  phones: string[];
  maxVisible?: number;
  scope?: string;
  Trigger: TTrigger;
  onSave: (value: { primaryPhone: string | null; phones: string[] }) => void;
}) => {
  const phoneProps = { primaryPhone: primaryPhone ?? '', phones };

  return (
    <PopoverScoped scope={scope}>
      <Trigger>
        <PhoneDisplay {...phoneProps} maxVisible={maxVisible} />
      </Trigger>
      <RecordTableInlineCell.Content className="w-72">
        <PhoneField
          recordId={id}
          {...phoneProps}
          onValueChange={(next) => onSave({ primaryPhone: next.primaryPhone || null, phones: next.phones ?? [] })}
        />
      </RecordTableInlineCell.Content>
    </PopoverScoped>
  );
};
