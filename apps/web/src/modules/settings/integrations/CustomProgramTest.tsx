import type { IntegrationProgram, IntegrationProgramRun } from '@erxes/core-contract';
import { messageOf, orpc } from '@erxes/core-contract/client';
import { IconPlayerPlay } from '@tabler/icons-react';
import { useMutation } from '@tanstack/react-query';
import { Button, jsonOf, Label, Spinner, Textarea, useToast } from 'erxes-ui';
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

export const CustomProgramTest = ({ program }: { program: IntegrationProgram }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'integrations.custom' });
  const { toast } = useToast();
  const incoming = program.kind === 'incoming';
  const [input, setInput] = useState('{}');
  const [body, setBody] = useState('{}');
  const [headers, setHeaders] = useState('{}');
  const parsedInput = InputJson.safeParse(input);
  const parsedHeaders = HeadersJson.safeParse(headers);
  const notJson = t('not-json', 'Write a JSON object, like {"name": "value"}.');

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
      test.mutate({ id: program.id, input: parsedInput.data });
    }
  };

  const ready = incoming ? parsedHeaders.success : parsedInput.success;

  return (
    <OverviewSection title={t('test', 'Test')}>
      <div className="space-y-3 rounded-lg border p-4">
        <p className="text-xs text-muted-foreground">
          {incoming
            ? t(
                'test-incoming-hint',
                'Sends a sample call. It reaches the service but publishes no events.',
              )
            : t(
                'test-action-hint',
                'Runs it once with this input. It reaches the service for real.',
              )}
        </p>
        {incoming ? (
          <>
            <JsonBox label={t('test-body', 'Body')} value={body} error={null} onChange={setBody} />
            <JsonBox
              label={t('test-headers', 'Headers')}
              value={headers}
              error={parsedHeaders.success ? null : notJson}
              onChange={setHeaders}
            />
          </>
        ) : (
          <JsonBox
            label={t('test-input', 'Input')}
            value={input}
            error={parsedInput.success ? null : notJson}
            onChange={setInput}
          />
        )}
        <div className="flex justify-end">
          <Button variant="secondary" disabled={!ready || test.isPending} onClick={run}>
            {test.isPending ? <Spinner size="sm" /> : <IconPlayerPlay />}
            {t('test-run', 'Run test')}
          </Button>
        </div>
        {test.data && <RunResult run={test.data} />}
      </div>
    </OverviewSection>
  );
};
