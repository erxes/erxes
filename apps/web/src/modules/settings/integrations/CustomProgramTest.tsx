import type { IntegrationProgram, IntegrationProgramRun } from '@erxes/core-contract';
import { messageOf, orpc } from '@erxes/core-contract/client';
import { IconPlayerPlay } from '@tabler/icons-react';
import { INTEGRATION_ACCOUNT_INPUT } from '@erxes/core-contract/integrationValues';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Button, jsonOf, Label, Select, Spinner, Textarea, useToast } from 'erxes-ui';
import { useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { OverviewSection } from './IntegrationLayout';

const InputJson = jsonOf(z.record(z.string(), z.unknown()));

const HeadersJson = jsonOf(z.record(z.string(), z.string()));

const JsonBox = ({
  label,
  value,
  error,
  onChange,
}: {
  label: string;
  value: string;
  error: string | null;
  onChange: (value: string) => void;
}) => {
  const id = useId();

  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Textarea id={id} rows={4} value={value} onChange={(event) => onChange(event.target.value)} />
      {error && <p className="text-xs text-destructive-text">{error}</p>}
    </div>
  );
};

const RunResult = ({ run }: { run: IntegrationProgramRun }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'integrations.custom' });

  if (!run.ok) {
    return (
      <div role="alert" className="space-y-1 rounded-lg border border-destructive/30 p-3 text-sm">
        <p className="font-medium text-destructive-text">
          {t('test-failed', 'It failed: {{code}}', { code: run.code })}
        </p>
        <p className="break-words">{run.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-success-text">{t('test-ok', 'It ran')}</p>
      <pre className="max-h-64 overflow-auto rounded-lg border bg-muted p-3 font-mono text-xs">
        {run.result === undefined
          ? t('test-nothing', 'No result')
          : JSON.stringify(run.result, null, 2)}
      </pre>
      {run.logs.length > 0 && (
        <>
          <p className="text-xs font-medium">{t('test-logs', 'Logs')}</p>
          <pre className="max-h-48 overflow-auto rounded-lg border p-3 font-mono text-xs">
            {run.logs.join('\n')}
          </pre>
        </>
      )}
    </div>
  );
};

const OWN_KEYS = 'own';

const TestAccount = ({
  integration,
  value,
  onChange,
}: {
  integration: string;
  value: string;
  onChange: (value: string) => void;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'integrations.custom' });
  const id = useId();

  const accounts = useQuery(orpc.integrationAccounts.list.queryOptions({ input: { integration } }));

  if (!accounts.data?.data.length) return null;

  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{t('test-account', 'Account')}</Label>
      <Select value={value} onValueChange={(next) => onChange(next ?? OWN_KEYS)}>
        <Select.Trigger id={id}>
          <Select.Value />
        </Select.Trigger>
        <Select.Content>
          <Select.Item value={OWN_KEYS}>
            {t('test-own-keys', 'The integration’s own keys')}
          </Select.Item>
          {accounts.data.data.map((account) => (
            <Select.Item key={account.id} value={account.id}>
              {account.name}
            </Select.Item>
          ))}
        </Select.Content>
      </Select>
    </div>
  );
};

const useProgramTest = (program: IntegrationProgram) => {
  const { t } = useTranslation('settings', { keyPrefix: 'integrations.custom' });
  const { toast } = useToast();
  const incoming = program.kind === 'incoming';
  const [account, setAccount] = useState(OWN_KEYS);
  const [input, setInput] = useState('{}');
  const [body, setBody] = useState('{}');
  const [headers, setHeaders] = useState('{}');
  const parsedInput = InputJson.safeParse(input);
  const parsedHeaders = HeadersJson.safeParse(headers);

  const test = useMutation(
    orpc.integrations.testProgram.mutationOptions({
      onError: (error) =>
        toast({
          variant: 'destructive',
          title: t('test-error', 'Could not run the test'),
          description: messageOf(error),
        }),
    }),
  );

  const run = () => {
    if (incoming && parsedHeaders.success) {
      test.mutate({ id: program.id, incoming: { headers: parsedHeaders.data, rawBody: body } });
    } else if (!incoming && parsedInput.success) {
      test.mutate({
        id: program.id,
        input:
          account === OWN_KEYS
            ? parsedInput.data
            : { ...parsedInput.data, [INTEGRATION_ACCOUNT_INPUT]: account },
      });
    }
  };

  return {
    incoming,
    account,
    setAccount,
    input,
    setInput,
    body,
    setBody,
    headers,
    setHeaders,
    inputValid: parsedInput.success,
    headersValid: parsedHeaders.success,
    ready: incoming ? parsedHeaders.success : parsedInput.success,
    run,
    pending: test.isPending,
    result: test.data,
  };
};

export const CustomProgramTest = ({
  program,
  integration,
}: {
  program: IntegrationProgram;
  integration: string;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'integrations.custom' });
  const test = useProgramTest(program);
  const notJson = t('not-json', 'Write a JSON object, like {"name": "value"}.');

  return (
    <OverviewSection title={t('test', 'Test')}>
      <div className="space-y-3 rounded-lg border p-4">
        <p className="text-xs text-muted-foreground">
          {test.incoming
            ? t(
                'test-incoming-hint',
                'Sends a sample call. It reaches the service but publishes no events.',
              )
            : t(
                'test-action-hint',
                'Runs it once with this input. It reaches the service for real.',
              )}
        </p>
        {test.incoming ? (
          <>
            <JsonBox
              label={t('test-body', 'Body')}
              value={test.body}
              error={null}
              onChange={test.setBody}
            />
            <JsonBox
              label={t('test-headers', 'Headers')}
              value={test.headers}
              error={test.headersValid ? null : notJson}
              onChange={test.setHeaders}
            />
          </>
        ) : (
          <>
            <TestAccount
              integration={integration}
              value={test.account}
              onChange={test.setAccount}
            />
            <JsonBox
              label={t('test-input', 'Input')}
              value={test.input}
              error={test.inputValid ? null : notJson}
              onChange={test.setInput}
            />
          </>
        )}
        <div className="flex justify-end">
          <Button variant="secondary" disabled={!test.ready || test.pending} onClick={test.run}>
            {test.pending ? <Spinner size="sm" /> : <IconPlayerPlay />}
            {t('test-run', 'Run test')}
          </Button>
        </div>
        {test.result && <RunResult run={test.result} />}
      </div>
    </OverviewSection>
  );
};
