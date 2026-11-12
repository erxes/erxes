import { IconPlus } from '@tabler/icons-react';
import { Button } from 'erxes-ui/components/button';
import { Input } from 'erxes-ui/components/input';
import { Separator } from 'erxes-ui/components/separator';
import { cn } from 'erxes-ui/lib/utils';
import { ValidationStatus } from 'erxes-ui/types/ValidationStatus';
import { useState } from 'react';
import { useFocusWhenShown, type ContactFieldInput } from '../hooks/useContactFieldInput';
import type { TEmails } from '../types/emailField';
import { emailSchema } from '../validations/emailValidation';

/**
 * Adds an email, or replaces the one being edited. EmailListField renders it keyed by
 * the email being edited, so the draft starts from that email.
 */
export const EmailFieldForm = ({
  emails,
  onValueChange,
  input,
}: {
  emails: TEmails;
  onValueChange: (emails: TEmails) => void;
  input: ContactFieldInput;
}) => {
  const { showInput, openInput, editing, closeInput } = input;
  const [draft, setDraft] = useState(editing ?? '');
  const [invalid, setInvalid] = useState(false);
  const inputRef = useFocusWhenShown(showInput);
  const label = editing ? 'Edit email' : 'Add email';

  const save = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!showInput) {
      openInput();

      return;
    }

    if (!emailSchema.safeParse({ email: draft }).success) {
      setInvalid(true);

      return;
    }

    if (editing) {
      onValueChange(
        emails.map((item) => (item.email === editing ? { ...item, email: draft } : item)),
      );
    } else {
      onValueChange([
        ...emails,
        { email: draft, status: ValidationStatus.Invalid, isPrimary: emails.length === 0 },
      ]);
    }

    setDraft('');
    closeInput();
  };

  return (
    <form onSubmit={save}>
      {showInput && (
        <div className="p-1 pt-0">
          <Input
            ref={inputRef}
            placeholder={label}
            variant="secondary"
            className={cn(invalid && 'focus-visible:shadow-destructive')}
            value={draft}
            onChange={(event) => {
              setDraft(event.target.value);
              setInvalid(false);
            }}
          />
        </div>
      )}
      <Separator />
      <div className="p-1">
        <Button variant="secondary" className="w-full" type="submit">
          <IconPlus />
          {label}
        </Button>
      </div>
    </form>
  );
};
