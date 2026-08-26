import { IconCheck, IconCopy, IconRefresh } from '@tabler/icons-react';
import {
  Badge,
  Button,
  Collapsible,
  Form,
  Input,
  Label,
  RadioGroup,
  Spinner,
  toast,
} from 'erxes-ui';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import {
  IMailSendingAccount,
  IMailSendingDnsRecord,
  useMailSendingAccountActions,
  useMailSendingReadiness,
} from '../hooks/useMailSendingAccounts';

const PROVIDERS = [
  { value: 'SES', label: 'Amazon SES' },
  { value: 'sendgrid', label: 'SendGrid' },
];

const DOMAIN_PATTERN = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9-]+)+$/;

const buildSchema = (credentialsRequired: boolean) =>
  z
    .object({
      name: z.string().trim().min(1),
      domain: z
        .string()
        .trim()
        .toLowerCase()
        .regex(DOMAIN_PATTERN),
      provider: z.enum(['SES', 'sendgrid']),
      awsAccessKeyId: z.string().trim(),
      awsSecretAccessKey: z.string().trim(),
      awsRegion: z.string().trim(),
      sendgridApiKey: z.string().trim(),
    })
    .superRefine((values, ctx) => {
      const usingSendgrid = values.provider === 'sendgrid';

      const entered = usingSendgrid
        ? Boolean(values.sendgridApiKey)
        : Boolean(values.awsAccessKeyId);

      if (!credentialsRequired && !entered) {
        return;
      }

      const missing: Array<keyof typeof values> = usingSendgrid
        ? ['sendgridApiKey']
        : ['awsAccessKeyId', 'awsSecretAccessKey', 'awsRegion'];

      for (const field of missing) {
        if (!values[field]) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: [field],
            message: 'required',
          });
        }
      }
    });

type SendingAccountValues = z.infer<ReturnType<typeof buildSchema>>;

export const MailSendingStatusBadge = ({
  status,
}: {
  status: IMailSendingAccount['status'];
}) => {
  const { t } = useTranslation('frontline');

  if (status === 'verified') {
    return <Badge variant="success">{t('mail-sending-verified')}</Badge>;
  }

  if (status === 'failed') {
    return <Badge variant="destructive">{t('mail-sending-failed')}</Badge>;
  }

  return <Badge variant="secondary">{t('mail-sending-pending')}</Badge>;
};

const DnsRecordRow = ({ record }: { record: IMailSendingDnsRecord }) => {
  const { t } = useTranslation('frontline');
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(`${record.host} ${record.data}`);
    setCopied(true);
    toast({ title: t('copied') });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-start gap-2 rounded border p-2 text-xs">
      <Badge variant="secondary" className="font-mono">
        {record.type}
      </Badge>
      <div className="min-w-0 flex-1 space-y-1 font-mono">
        <p className="break-all">{record.host}</p>
        <p className="break-all text-muted-foreground">{record.data}</p>
      </div>
      {record.valid && <IconCheck size={14} className="text-primary" />}
      <Button size="icon" variant="ghost" type="button" onClick={copy}>
        {copied ? <IconCheck size={14} /> : <IconCopy size={14} />}
      </Button>
    </div>
  );
};

export const MailSendingAccountStatus = ({
  account,
  onVerify,
  verifying,
}: {
  account: IMailSendingAccount;
  onVerify: () => void;
  verifying: boolean;
}) => {
  const { t } = useTranslation('frontline');
  const records = account.dnsRecords ?? [];

  return (
    <div className="space-y-3 rounded-lg border p-3">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">{account.domain}</span>
        <MailSendingStatusBadge status={account.status} />
        <Button
          size="sm"
          variant="secondary"
          type="button"
          className="ml-auto"
          onClick={onVerify}
          disabled={verifying}
        >
          {verifying ? <Spinner size="sm" /> : <IconRefresh size={14} />}
          {t('mail-sending-check-again')}
        </Button>
      </div>

      {account.status !== 'verified' && (
        <p className="text-xs text-muted-foreground">
          {account.error || t('mail-sending-dns-description')}
        </p>
      )}

      {records.length > 0 && (
        <div className="space-y-2">
          {records.map((record) => (
            <DnsRecordRow
              key={`${record.type}-${record.host}`}
              record={record}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const MailSendingAccountForm = ({
  onCreated,
  onCancel,
}: {
  onCreated: (account: IMailSendingAccount) => void;
  onCancel?: () => void;
}) => {
  const { t } = useTranslation('frontline');
  const { addAccount, adding } = useMailSendingAccountActions();
  const { readiness } = useMailSendingReadiness();

  const credentialsRequired = !readiness?.platform?.ready;

  const schema = useMemo(
    () => buildSchema(credentialsRequired),
    [credentialsRequired],
  );

  const form = useForm<SendingAccountValues>({
    resolver: zodResolver(schema),
    mode: 'onChange',
    defaultValues: {
      name: '',
      domain: '',
      provider: 'SES',
      awsAccessKeyId: '',
      awsSecretAccessKey: '',
      awsRegion: '',
      sendgridApiKey: '',
    },
  });

  const provider = form.watch('provider');
  const usingSendgrid = provider === 'sendgrid';

  const onSubmit = (values: SendingAccountValues) => {
    const entered = usingSendgrid
      ? Boolean(values.sendgridApiKey)
      : Boolean(values.awsAccessKeyId);

    const credentials = usingSendgrid
      ? { provider: values.provider, sendgridApiKey: values.sendgridApiKey }
      : {
          provider: values.provider,
          awsAccessKeyId: values.awsAccessKeyId,
          awsSecretAccessKey: values.awsSecretAccessKey,
          awsRegion: values.awsRegion,
        };

    return addAccount({
      variables: {
        name: values.name,
        domain: values.domain,
        ...(credentialsRequired || entered ? credentials : {}),
      },
      onCompleted(data) {
        const created = data?.mailSendingAccountAdd;

        if (created) {
          onCreated(created);
        }
      },
    });
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-3 rounded-lg border p-3"
      >
        <Form.Field
          control={form.control}
          name="name"
          render={({ field }) => (
            <Form.Item>
              <Form.Label className="text-xs text-muted-foreground">
                {t('mail-sending-account-name')}
              </Form.Label>
              <Form.Control>
                <Input
                  {...field}
                  placeholder={t('mail-sending-account-name-placeholder')}
                />
              </Form.Control>
              <Form.Message />
            </Form.Item>
          )}
        />

        <Form.Field
          control={form.control}
          name="domain"
          render={({ field }) => (
            <Form.Item>
              <Form.Label className="text-xs text-muted-foreground">
                {t('mail-sending-domain')}
              </Form.Label>
              <Form.Control>
                <Input {...field} placeholder="acme.com" />
              </Form.Control>
              <Form.Description>
                {t('mail-sending-domain-description')}
              </Form.Description>
              <Form.Message />
            </Form.Item>
          )}
        />

        <Collapsible defaultOpen={credentialsRequired}>
          <Collapsible.Trigger asChild>
            <Button
              variant="ghost"
              type="button"
              className="h-auto w-full justify-start gap-2 px-0 text-xs font-normal text-muted-foreground"
            >
              <Collapsible.TriggerIcon />
              {t(
                credentialsRequired
                  ? 'mail-sending-provider-required'
                  : 'mail-sending-own-provider',
              )}
            </Button>
          </Collapsible.Trigger>
          <Collapsible.Content className="space-y-3 pt-2">
            <p className="text-xs text-muted-foreground">
              {t(
                credentialsRequired
                  ? 'mail-sending-provider-required-description'
                  : 'mail-sending-own-provider-description',
              )}
            </p>

            <Form.Field
              control={form.control}
              name="provider"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label className="text-xs text-muted-foreground">
                    {t('mail-sending-provider')}
                  </Form.Label>
                  <Form.Control>
                    <RadioGroup
                      value={field.value}
                      onValueChange={field.onChange}
                      className="flex gap-4"
                    >
                      {PROVIDERS.map((option) => (
                        <Label
                          key={option.value}
                          className="flex items-center gap-2 text-sm font-normal"
                        >
                          <RadioGroup.Item value={option.value} />
                          {option.label}
                        </Label>
                      ))}
                    </RadioGroup>
                  </Form.Control>
                </Form.Item>
              )}
            />

            {usingSendgrid ? (
              <Form.Field
                control={form.control}
                name="sendgridApiKey"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label className="text-xs text-muted-foreground">
                      {t('mail-sending-sendgrid-key')}
                    </Form.Label>
                    <Form.Control>
                      <Input {...field} type="password" placeholder="SG." />
                    </Form.Control>
                    <Form.Message />
                  </Form.Item>
                )}
              />
            ) : (
              <>
                <Form.Field
                  control={form.control}
                  name="awsAccessKeyId"
                  render={({ field }) => (
                    <Form.Item>
                      <Form.Label className="text-xs text-muted-foreground">
                        {t('mail-sending-aws-key-id')}
                      </Form.Label>
                      <Form.Control>
                        <Input {...field} placeholder="AKIA…" />
                      </Form.Control>
                      <Form.Message />
                    </Form.Item>
                  )}
                />
                <Form.Field
                  control={form.control}
                  name="awsSecretAccessKey"
                  render={({ field }) => (
                    <Form.Item>
                      <Form.Label className="text-xs text-muted-foreground">
                        {t('mail-sending-aws-secret')}
                      </Form.Label>
                      <Form.Control>
                        <Input {...field} type="password" />
                      </Form.Control>
                      <Form.Message />
                    </Form.Item>
                  )}
                />
                <Form.Field
                  control={form.control}
                  name="awsRegion"
                  render={({ field }) => (
                    <Form.Item>
                      <Form.Label className="text-xs text-muted-foreground">
                        {t('mail-sending-aws-region')}
                      </Form.Label>
                      <Form.Control>
                        <Input {...field} placeholder="us-east-1" />
                      </Form.Control>
                      <Form.Description>
                        {t('mail-sending-aws-region-required')}
                      </Form.Description>
                      <Form.Message />
                    </Form.Item>
                  )}
                />
              </>
            )}
          </Collapsible.Content>
        </Collapsible>

        <div className="flex items-center gap-2">
          {onCancel && (
            <Button
              variant="ghost"
              type="button"
              className="text-muted-foreground"
              onClick={onCancel}
              disabled={adding}
            >
              {t('cancel')}
            </Button>
          )}
          <Button
            type="submit"
            className="ml-auto"
            disabled={!form.formState.isValid || adding}
          >
            {adding ? <Spinner size="sm" /> : null}
            {t('save')}
          </Button>
        </div>
      </form>
    </Form>
  );
};
