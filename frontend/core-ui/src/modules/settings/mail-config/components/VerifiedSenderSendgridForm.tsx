import { useSendgridSenderForm } from '@/settings/mail-config/hooks/useSendgridSenderForm';
import { Button, Dialog, Form, Input } from 'erxes-ui';
import { FormProvider } from 'react-hook-form';

const FIELDS = [
  {
    name: 'name' as const,
    label: 'From name',
    placeholder: 'Sales team',
    required: true,
  },
  {
    name: 'email' as const,
    label: 'From email',
    placeholder: 'sales@example.com',
    type: 'email',
    required: true,
  },
  {
    name: 'replyTo' as const,
    label: 'Reply to',
    placeholder: 'sales@example.com',
    type: 'email',
  },
  {
    name: 'address' as const,
    label: 'Address',
    placeholder: 'Sukhbaatar district, 1st khoroo',
    required: true,
  },
  {
    name: 'city' as const,
    label: 'City',
    placeholder: 'Ulaanbaatar',
    required: true,
  },
  {
    name: 'country' as const,
    label: 'Country',
    placeholder: 'Mongolia',
    required: true,
  },
];

/**
 * SendGrid stores a postal address alongside every sender identity, which
 * anti-spam law requires on commercial mail. SES asks for nothing but the
 * address, so it keeps the lighter inline flow instead of this form.
 */
export const VerifiedSenderSendgridForm = ({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  const { form, onSubmit, loading } = useSendgridSenderForm({ onOpenChange });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <Dialog.Content className="max-w-lg">
        <Dialog.Header>
          <Dialog.Title>Verify a sender</Dialog.Title>
          <Dialog.Description>
            SendGrid emails this address a confirmation link. It can only send
            once someone opens that link.
          </Dialog.Description>
        </Dialog.Header>

        <FormProvider {...form}>
          <form onSubmit={onSubmit} className="grid grid-cols-2 gap-3">
            {FIELDS.map(({ name, label, placeholder, type, required }) => (
              <Form.Field
                key={name}
                name={name}
                control={form.control}
                render={({ field }) => (
                  <Form.Item className="col-span-2 sm:col-span-1">
                    <Form.Label>
                      {label}
                      {required && <span className="text-destructive">*</span>}
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

            <Dialog.Footer className="col-span-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                Send verification
              </Button>
            </Dialog.Footer>
          </form>
        </FormProvider>
      </Dialog.Content>
    </Dialog>
  );
};
