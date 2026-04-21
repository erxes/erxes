import { IconPlus, IconInfoCircle } from '@tabler/icons-react';
import { Button, Input, Form, Sheet, Alert } from 'erxes-ui';
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

/* ── Shared FormField ────────────────────────────────────────────────── */

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

/* ── Gmail helper ────────────────────────────────────────────────────── */

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

/* ── Add sheet ───────────────────────────────────────────────────────── */

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
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <Sheet.Trigger asChild>
        <Button className="h-9">
          <IconPlus className="h-4 w-4 mr-2" />
          Add IMAP Integration
        </Button>
      </Sheet.Trigger>

      <Sheet.View className="sm:max-w-2xl">
        <Sheet.Header>
          <Sheet.Title>Add IMAP Integration</Sheet.Title>
          <Sheet.Close />
        </Sheet.Header>

        <Sheet.Content className="px-6 py-4 overflow-y-auto max-h-[calc(100vh-180px)]">
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
        </Sheet.Content>

        <Sheet.Footer className="px-6 py-4">
          <Button variant="outline" onClick={() => setIsOpen(false)} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" form="imap-form" disabled={loading}>
            {loading ? 'Saving…' : 'Save'}
          </Button>
        </Sheet.Footer>
      </Sheet.View>
    </Sheet>
  );
};
