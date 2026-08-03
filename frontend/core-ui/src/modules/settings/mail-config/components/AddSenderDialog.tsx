import { useSenderForm } from '@/settings/mail-config/hooks/useSenderForm';
import { useSenderOptions } from '@/settings/mail-config/hooks/useVerifiedSenders';
import { IconInfoCircle } from '@tabler/icons-react';
import { Alert, Button, Dialog, Form, Input } from 'erxes-ui';
import { FormProvider } from 'react-hook-form';

const FIELDS = [
  {
    name: 'name' as const,
    label: 'Sender name',
    placeholder: 'Sales team',
  },
  {
    name: 'email' as const,
    label: 'Email address',
    placeholder: 'sales@example.com',
    type: 'email',
  },
];

export const AddSenderDialog = ({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  const { form, onSubmit, loading } = useSenderForm({ onOpenChange });
  const { supportsDynamicSender, defaultSenderEmail } = useSenderOptions();

  const email = form.watch('email');
  const name = form.watch('name');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <Dialog.Content className="max-w-lg">
        <Dialog.Header>
          <Dialog.Title>Add a sender address</Dialog.Title>
          <Dialog.Description>
            A confirmation link goes to this address. It can be used once
            someone opens that link and confirms.
          </Dialog.Description>
        </Dialog.Header>

        {!supportsDynamicSender && (
          <Alert>
            <IconInfoCircle />
            <Alert.Title>Replies only</Alert.Title>
            <Alert.Description>
              Mail will be sent from{' '}
              <code>{defaultSenderEmail || 'the platform address'}</code> and
              replies will arrive at this address. Sending from your own domain
              needs that domain authenticated with your mail provider —
              otherwise the mail fails authentication checks and lands in spam.
            </Alert.Description>
          </Alert>
        )}

        <FormProvider {...form}>
          <form
            onSubmit={(event) => {
              event.stopPropagation();
              onSubmit(event);
            }}
            className="grid grid-cols-2 gap-3"
          >
            {FIELDS.map(({ name: fieldName, label, placeholder, type }) => (
              <Form.Field
                key={fieldName}
                name={fieldName}
                control={form.control}
                render={({ field }) => (
                  <Form.Item className="col-span-2 sm:col-span-1">
                    <Form.Label>
                      {label}
                      <span className="text-destructive">*</span>
                    </Form.Label>
                    <Form.Control>
                      <Input
                        {...field}
                        value={field.value || ''}
                        type={type}
                        placeholder={placeholder}
                      />
                    </Form.Control>
                    <Form.Message />
                  </Form.Item>
                )}
              />
            ))}

            {!supportsDynamicSender && (name || email) && (
              <p className="col-span-2 text-xs text-muted-foreground">
                Recipients will see{' '}
                <span className="text-foreground">
                  {name || email.split('@')[1]} &lt;
                  {defaultSenderEmail || 'noreply'}&gt;
                </span>
              </p>
            )}

            <Dialog.Footer className="col-span-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                Send confirmation
              </Button>
            </Dialog.Footer>
          </form>
        </FormProvider>
      </Dialog.Content>
    </Dialog>
  );
};
