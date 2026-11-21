import { isApiError, messageOf, orpc } from '@erxes/core-contract/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button, Dialog, Input, Label, Spinner, useToast } from 'erxes-ui';
import { type SubmitEvent, useId, useState } from 'react';
import { useTranslation } from 'react-i18next';

type Errors = { name?: string; email?: string };

const SenderField = ({
  id,
  label,
  error,
  ...input
}: {
  id: string;
  label: string;
  error?: string;
  value: string;
  type?: string;
  placeholder: string;
  onChange: (value: string) => void;
}) => (
  <div className="space-y-1.5">
    <Label htmlFor={id}>{label}</Label>
    <Input
      id={id}
      type={input.type}
      value={input.value}
      placeholder={input.placeholder}
      onChange={(event) => input.onChange(event.target.value)}
      aria-required
      aria-invalid={!!error}
      aria-describedby={error ? `${id}-error` : undefined}
    />
    {error && (
      <p id={`${id}-error`} className="text-sm text-destructive-text">
        {error}
      </p>
    )}
  </div>
);

/** Adds a sender; the address is emailed a link that confirms it. */
const useAddSender = (onDone: (email: string) => void) => {
  const { t } = useTranslation('settings', { keyPrefix: 'integrations.email.senders' });
  const { toast } = useToast();
  const client = useQueryClient();
  const [errors, setErrors] = useState<Errors>({});

  const add = useMutation(
    orpc.emails.addSender.mutationOptions({
      onSuccess: async (sender) => {
        await client.invalidateQueries({ queryKey: orpc.emails.senders.key() });
        onDone(sender.email);
      },
      onError: (error) => {
        if (isApiError(error, 'TAKEN')) {
          setErrors({ email: t('taken', 'This address is a sender already.') });
        } else if (isApiError(error, 'INVALID_INPUT')) {
          setErrors({ email: t('invalid-email', 'Enter a valid email address.') });
        } else {
          toast({
            variant: 'destructive',
            title: t('add-failed', 'Could not add the sender'),
            description: messageOf(error),
          });
        }
      },
    }),
  );

  const save = (name: string, email: string) => {
    const missing: Errors = {
      ...(name ? {} : { name: t('name-required', 'Enter the name people see') }),
      ...(email ? {} : { email: t('email-required', 'Enter the address') }),
    };

    setErrors(missing);

    if (!missing.name && !missing.email) add.mutate({ name, email });
  };

  return { save, errors, saving: add.isPending };
};

const AddSenderForm = ({ onDone }: { onDone: (email?: string) => void }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'integrations.email.senders' });
  const id = useId();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const { save, errors, saving } = useAddSender(onDone);

  const submit = (event: SubmitEvent) => {
    event.preventDefault();
    save(name.trim(), email.trim());
  };

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-4">
      <SenderField
        id={`${id}-name`}
        label={t('name', 'Name people see')}
        placeholder={t('name-placeholder', 'Sales team')}
        value={name}
        onChange={setName}
        error={errors.name}
      />
      <SenderField
        id={`${id}-email`}
        label={t('email', 'Address')}
        type="email"
        placeholder="sales@example.com"
        value={email}
        onChange={setEmail}
        error={errors.email}
      />
      <Dialog.Footer>
        <Button type="button" variant="outline" onClick={() => onDone()} disabled={saving}>
          {t('cancel', 'Cancel')}
        </Button>
        <Button type="submit" disabled={saving}>
          {saving && <Spinner size="sm" />}
          {t('send-link', 'Send confirmation link')}
        </Button>
      </Dialog.Footer>
    </form>
  );
};

/** Add a sender: its name and address; the address gets a confirmation link. */
export const AddSenderDialog = ({
  open,
  onClose,
}: {
  open: boolean;
  onClose: (email?: string) => void;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'integrations.email.senders' });

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <Dialog.Content className="max-w-md">
        <Dialog.Header>
          <Dialog.Title>{t('add-title', 'Add a sender')}</Dialog.Title>
          <Dialog.Description>
            {t(
              'add-description',
              'We email the address a link. It can be picked once someone opens the link.',
            )}
          </Dialog.Description>
        </Dialog.Header>
        {open && <AddSenderForm onDone={onClose} />}
      </Dialog.Content>
    </Dialog>
  );
};
