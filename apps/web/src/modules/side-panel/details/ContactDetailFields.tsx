import { type Icon, IconMail, IconPhone, IconUser } from '@tabler/icons-react';
import { memberQueries } from '@erxes/core-contract/client';
import { ScrollArea, SelectMember, TextField } from 'erxes-ui';
import { type ReactNode, useId } from 'react';
import { ContactEmails, ContactPhones } from '~/modules/contacts/components/ContactFields';
import { PanelField, PanelFieldTrigger } from '../PanelField';
import { ContactDetailSection } from './ContactDetailSection';

/** A contact's Detail tab scrolling under the panel header. */
export const ContactDetailScroll = ({ children }: { children: ReactNode }) => (
  // Radix sizes its content as a table, which lets wide values push past the
  // panel; a block lets each value shrink and truncate instead.
  <ScrollArea className="flex-1 min-h-0" viewportClassName="[&>div]:block!">
    {children}
  </ScrollArea>
);

/** A text value saved on blur; `onSave` gets the trimmed text, or null when cleared. */
export const ContactTextField = ({
  scope,
  value,
  placeholder,
  icon: FieldIcon,
  onSave,
}: {
  scope: string;
  value: string;
  placeholder: string;
  icon: Icon;
  onSave: (next: string | null) => void;
}) => (
  <TextField
    scope={scope}
    value={value}
    placeholder={placeholder}
    variant="field"
    onSave={(next) => {
      if (next.trim() !== value) onSave(next.trim() || null);
    }}
  >
    {!value && <FieldIcon className="size-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />}
  </TextField>
);

export const ContactOwnerField = ({
  label,
  scope,
  ownerId,
  onChange,
}: {
  label: string;
  scope: string;
  ownerId: string | null;
  onChange: (ownerId: string | null) => void;
}) => {
  const controlId = useId();

  return (
    <PanelField
      icon={IconUser}
      label={label}
      htmlFor={controlId}
      placeholder={ownerId ? undefined : label}
    >
      <SelectMember.InlineCell
        id={controlId}
        scope={scope}
        value={ownerId}
        placeholder={ownerId ? label : ''}
        aria-label={ownerId ? undefined : label}
        variant="field"
        members={memberQueries}
        onValueChange={onChange}
      />
    </PanelField>
  );
};

interface ContactChannels {
  id: string;
  primaryEmail: string | null;
  emails: string[];
  primaryPhone: string | null;
  phones: string[];
}

/** A contact's e-mails and phones, each saved with its primary one. */
export const ContactChannelsSection = ({
  title,
  labels,
  scope,
  contact,
  onSave,
}: {
  title: string;
  labels: { emails: string; phones: string };
  scope: string;
  contact: ContactChannels;
  onSave: (
    value:
      | { primaryEmail: string | null; emails: string[] }
      | {
          primaryPhone: string | null;
          phones: string[];
        },
  ) => void;
}) => (
  <ContactDetailSection title={title} nested>
    <PanelField
      icon={IconMail}
      label={labels.emails}
      placeholder={
        !contact.primaryEmail && !contact.emails.some(Boolean) ? labels.emails : undefined
      }
    >
      <ContactEmails
        maxVisible={1}
        id={contact.id}
        primaryEmail={contact.primaryEmail}
        emails={contact.emails}
        scope={`${scope}.emails`}
        Trigger={PanelFieldTrigger}
        onSave={onSave}
      />
    </PanelField>
    <PanelField
      icon={IconPhone}
      label={labels.phones}
      placeholder={
        !contact.primaryPhone && !contact.phones.some(Boolean) ? labels.phones : undefined
      }
    >
      <ContactPhones
        maxVisible={1}
        id={contact.id}
        primaryPhone={contact.primaryPhone}
        phones={contact.phones}
        scope={`${scope}.phones`}
        Trigger={PanelFieldTrigger}
        onSave={onSave}
      />
    </PanelField>
  </ContactDetailSection>
);
