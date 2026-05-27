import { IconPlus, IconInfoCircle, IconX } from '@tabler/icons-react';
import { Button, Input, Form, Dialog, Alert } from 'erxes-ui';
import { useAtom } from 'jotai';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { imapFormSheetAtom } from '../states/imapStates';
import { useIntegrationAdd } from '@/integrations/hooks/useIntegrationAdd';
import { IntegrationType } from '@/types/Integration';
import { useParams } from 'react-router';
import { SelectBrand } from 'ui-modules';

/* ── Schema ─────────────────────────────────────────────────────────── */

export const imapFormSchema = z.object({
  name: z.string().min(1),
  host: z.string().min(1),
  smtpHost: z.string().min(1),
  smtpPort: z.string().min(1),
  mainUser: z.string().optional(),
  user: z.string().min(1),
  password: z.string().min(1),
  brandId: z.string().min(1, 'Brand is required'),
});

export type ImapFormValues = z.infer<typeof imapFormSchema>;

/* ── Field config ────────────────────────────────────────────────────── */

export type FormFieldConfig = {
  name: keyof ImapFormValues;
  label: string;
  placeholder: string;
  required?: boolean;
  type?: string;
};

export const IMAP_FORM_FIELDS: FormFieldConfig[] = [
  { name: 'name', label: 'Name', placeholder: 'Enter integration name', required: true },
  { name: 'host', label: 'IMAP Host', placeholder: 'imap.example.com', required: true },
  { name: 'smtpHost', label: 'SMTP Host', placeholder: 'smtp.example.com', required: true },
  { name: 'smtpPort', label: 'SMTP Port', placeholder: '465', required: true },
  { name: 'mainUser', label: 'Main User', placeholder: 'alias@example.com (optional)' },
  { name: 'user', label: 'User', placeholder: 'login@example.com', required: true },
  { name: 'password', label: 'Password', placeholder: '••••••••', type: 'password', required: true },
];

const GMAIL_CONFIG = {
  host: 'imap.gmail.com',
  smtpHost: 'smtp.gmail.com',
  smtpPort: '465',
  appPasswordGuide: 'https://support.google.com/accounts/answer/185833',
};


export const ImapFormField = ({
  name,
  label,
  placeholder,
  type = 'text',
  required,
  control,
}: FormFieldConfig & { control: any }) => (
  <Form.Field
    name={name}
    control={control}
    render={({ field }) => (
      <Form.Item className="space-y-1">
        <Form.Label className="text-sm font-normal text-muted-foreground">
          {label}
          {required && <span className="ml-0.5 text-destructive">*</span>}
        </Form.Label>
        <Form.Control>
          <Input
            {...field}
            type={type}
            placeholder={placeholder}
            value={field.value ?? ''}
            className="h-9"
          />
        </Form.Control>
        <Form.Message />
      </Form.Item>
    )}
  />
);


const GmailConfigHelper = () => (
  <Alert className="mb-4">
    <IconInfoCircle className="h-4 w-4" />
    <Alert.Title className="font-medium">Gmail Configuration</Alert.Title>
    <Alert.Description className="mt-2 text-sm space-y-1">
      <p><strong>Host:</strong> {GMAIL_CONFIG.host}</p>
      <p><strong>SMTP Host:</strong> {GMAIL_CONFIG.smtpHost}</p>
      <p><strong>SMTP Port:</strong> {GMAIL_CONFIG.smtpPort}</p>
      <p>
        <strong>Password:</strong>
        <a
          href={GMAIL_CONFIG.appPasswordGuide}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-1 text-blue-600 hover:underline"
        >
          Create an app password
        </a>
      </p>
    </Alert.Description>
  </Alert>
);


export const ImapIntegrationFormSheet = () => {
  const [isOpen, setIsOpen] = useAtom(imapFormSheetAtom);
  const { id } = useParams();

  const form = useForm<ImapFormValues>({
    resolver: zodResolver(imapFormSchema),
    defaultValues: {
      name: '',
      host: '',
      smtpHost: '',
      smtpPort: '',
      mainUser: '',
      user: '',
      password: '',
      brandId: '',
    },
  });

  const { addIntegration, loading } = useIntegrationAdd();

  const onSubmit = (data: ImapFormValues) => {
    addIntegration({
      variables: {
        name: data.name,
        kind: IntegrationType.IMAP,
        channelId: id ?? '',
        brandId: data.brandId,
        data: {
          host: data.host,
          smtpHost: data.smtpHost,
          smtpPort: data.smtpPort,
          mainUser: data.mainUser,
          user: data.user,
          password: data.password,
        },
      },
      onCompleted() {
        form.reset();
        setIsOpen(false);
      },
    });
  };

  return (
    <div>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <Dialog.Trigger asChild>
          <Button>
            <IconPlus />
            Add IMAP Integration
          </Button>
        </Dialog.Trigger>

        <Dialog.Content className="p-0 gap-0 max-w-md max-h-[90vh] flex flex-col overflow-hidden">
          <Dialog.Header className="flex-row items-center justify-between space-y-0 px-5 h-14 border-b flex-none">
            <Dialog.Title>Add IMAP Integration</Dialog.Title>
            <Dialog.Close asChild>
              <Button variant="secondary" size="icon" className="ml-auto">
                <IconX />
              </Button>
            </Dialog.Close>
          </Dialog.Header>

          <div className="flex-1 overflow-y-auto flex flex-col gap-4 py-6 px-6">
            <GmailConfigHelper />

            <Form {...form}>
              <form
                id="imap-form"
                onSubmit={form.handleSubmit(onSubmit)}
                className="grid grid-cols-1 gap-3"
              >
                {IMAP_FORM_FIELDS.map((field) => (
                  <ImapFormField key={field.name} {...field} control={form.control} />
                ))}

                <Form.Field
                  name="brandId"
                  control={form.control}
                  render={({ field }) => (
                    <Form.Item>
                      <Form.Label>
                        Brand <span className="text-destructive">*</span>
                      </Form.Label>
                      <Form.Control>
                        <SelectBrand
                          value={field.value}
                          onValueChange={field.onChange}
                          placeholder="Select a brand"
                          className="w-full h-10 rounded-lg border bg-background"
                        />
                      </Form.Control>
                      <Form.Description>
                        Choose the brand for this integration
                      </Form.Description>
                      <Form.Message />
                    </Form.Item>
                  )}
                />
              </form>
            </Form>
          </div>

          <div className="flex items-center h-14 px-5 border-t flex-none">
            <Dialog.Close asChild>
              <Button
                className="mr-auto text-muted-foreground"
                variant="ghost"
                disabled={loading}
              >
                Cancel
              </Button>
            </Dialog.Close>
            <Button type="submit" form="imap-form" disabled={loading}>
              {loading ? 'Saving…' : 'Save'}
            </Button>
          </div>
        </Dialog.Content>
      </Dialog>
    </div>
  );
};
