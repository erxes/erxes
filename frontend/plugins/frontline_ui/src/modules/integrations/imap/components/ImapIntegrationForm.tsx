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

const FORM_FIELDS = [
  {
    name: 'name',
    label: 'Name',
    placeholder: 'Enter integration name',
    required: true,
  },
  {
    name: 'host',
    label: 'IMAP Host',
    placeholder: 'Enter IMAP host',
    required: true,
  },
  {
    name: 'smtpHost',
    label: 'SMTP Host',
    placeholder: 'Enter SMTP host',
    required: true,
  },
  {
    name: 'smtpPort',
    label: 'SMTP Port',
    placeholder: 'Enter SMTP port',
    required: true,
  },
  {
    name: 'mainUser',
    label: 'Main User',
    placeholder: 'Enter main user email (for aliases)',
  },
  {
    name: 'user',
    label: 'User',
    placeholder: 'Enter username',
    required: true,
  },
  {
    name: 'password',
    label: 'Password',
    placeholder: 'Enter password',
    type: 'password',
    required: true,
  },
] as const;

const GMAIL_CONFIG = {
  host: 'imap.gmail.com',
  smtpHost: 'smtp.gmail.com',
  smtpPort: '465',
  appPasswordGuide: 'https://support.google.com/accounts/answer/185833?hl=en',
};

export const imapFormSchema = z.object({
  name: z.string().min(1),
  host: z.string().min(1),
  smtpHost: z.string().min(1),
  smtpPort: z.string().min(1),
  mainUser: z.string().optional(),
  user: z.string().min(1),
  password: z.string().min(1),
});

export type ImapFormValues = z.infer<typeof imapFormSchema>;

const FormField = ({
  name,
  label,
  placeholder,
  type = 'text',
  control,
}: {
  name: keyof ImapFormValues;
  label: string;
  placeholder: string;
  type?: string;
  control: any;
}) => (
  <Form.Field
    name={name}
    control={control}
    render={({ field }) => (
      <Form.Item className="space-y-1">
        <Form.Label className="text-sm font-normal text-muted-foreground">
          {label} {FORM_FIELDS.find((f) => f.name === name)?.required && '*'}
        </Form.Label>
        <Form.Control>
          <Input
            {...field}
            type={type}
            placeholder={placeholder}
            value={field.value || ''}
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
      <p>
        <strong>Host:</strong> {GMAIL_CONFIG.host}
      </p>
      <p>
        <strong>SMTP Host:</strong> {GMAIL_CONFIG.smtpHost}
      </p>
      <p>
        <strong>SMTP Port:</strong> {GMAIL_CONFIG.smtpPort}
      </p>
      <p>
        <strong>Password:</strong>
        <a
          href={GMAIL_CONFIG.appPasswordGuide}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-1 text-blue-600 hover:underline"
        >
          Follow the app password creation guide
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
    },
  });

  const { addIntegration, loading } = useIntegrationAdd();

  const submitHandler = (data: ImapFormValues) => {
    addIntegration({
      variables: {
        name: data.name,
        kind: IntegrationType.IMAP,
        channelId: id || '',
        data,
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
          <GmailConfigHelper className="sticky top-0 bg-background z-10" />

          <Form {...form}>
            <form
              id="imap-form"
              onSubmit={form.handleSubmit(submitHandler)}
              className="grid grid-cols-1 gap-3"
            >
              {FORM_FIELDS.map((field) => (
                <FormField
                  key={field.name}
                  name={field.name}
                  label={field.label}
                  placeholder={field.placeholder}
                  type={field.type}
                  control={form.control}
                />
              ))}
            </form>
          </Form>
        </Sheet.Content>

        <Sheet.Footer className="px-6 py-4">
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={loading}
          >
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
