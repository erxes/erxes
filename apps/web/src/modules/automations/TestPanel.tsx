import type { Automation, coreContract } from '@erxes/core-contract';
import type { InferContractRouterOutputs } from '@orpc/contract';
import { IconFlask } from '@tabler/icons-react';
import { useMutation } from '@tanstack/react-query';
import { Badge, Button, Input, jsonOf, Label, Sheet, Spinner, Switch, Textarea } from 'erxes-ui';
import { useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { messageOf, orpc } from '@erxes/core-contract/client';
import { ContactSelect } from '~/modules/contacts/components/ContactPicker';

type TestResult = InferContractRouterOutputs<typeof coreContract>['automations']['test'];

const TestTrace = ({ result }: { result: TestResult }) => {
  const { t } = useTranslation('automations');

  return (
    <div className="min-h-0 flex-1 space-y-2 overflow-auto">
      <div className="flex gap-2">
        <Badge variant={result.triggerMatches ? 'success' : 'warning'}>
          {result.triggerMatches
            ? t('trigger-matches', 'The trigger’s conditions hold')
            : t('trigger-not', 'The trigger’s conditions don’t hold')}
        </Badge>
        {result.goalMetAtStart && (
          <Badge variant="info">{t('goal-already', 'Goal already met')}</Badge>
        )}
      </div>
      <ol className="space-y-2">
        {/* A dry run moves forward through the steps, so each step shows up once. */}
        {result.trace.map((item) => (
          <li key={item.stepId} className="rounded-md border p-2 text-sm">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-muted-foreground">#{item.stepId}</span>
              <span>{item.outcome}</span>
            </div>
            {item.problem && <p className="mt-1 text-xs text-destructive-text">{item.problem}</p>}
            {item.input !== null && item.input !== undefined && (
              <pre className="mt-1 max-h-40 overflow-auto rounded bg-muted p-2 text-2xs">
                {JSON.stringify(item.input, null, 2)}
              </pre>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
};

const SAMPLE_BODY = '{\n  "email": "name@example.com"\n}';

const sampleRequest = (body: string, query: string) => {
  const parsed = jsonOf(z.json()).safeParse(body.trim() || 'null');

  if (!parsed.success) return null;

  return {
    method: 'POST',
    body: parsed.data,
    query: Object.fromEntries(new URLSearchParams(query.trim().replace(/^\?/, ''))),
  };
};

const SampleRequest = ({
  body,
  query,
  onBody,
  onQuery,
  invalid,
}: {
  body: string;
  query: string;
  onBody: (body: string) => void;
  onQuery: (query: string) => void;
  invalid: boolean;
}) => {
  const { t } = useTranslation('automations');
  const id = useId();

  return (
    <>
      <Label htmlFor={`${id}-body`}>{t('test-body', 'Request body (JSON)')}</Label>
      <Textarea
        id={`${id}-body`}
        rows={8}
        text="code"
        value={body}
        aria-invalid={invalid}
        onChange={(event) => onBody(event.target.value)}
      />
      {invalid && (
        <p className="text-xs text-destructive-text">
          {t('test-body-invalid', 'Not valid JSON yet.')}
        </p>
      )}
      <Label htmlFor={`${id}-query`}>{t('test-query', 'Query (optional)')}</Label>
      <Input
        id={`${id}-query`}
        text="code"
        value={query}
        placeholder="plan=pro&source=site"
        onChange={(event) => onQuery(event.target.value)}
      />
    </>
  );
};

/** A record to test with, or for a webhook a sample call; mounted while the sheet is open. */
const TestForm = ({
  automationId,
  type,
  webhook,
}: {
  automationId: string;
  type: 'customer' | 'company';
  webhook: boolean;
}) => {
  const { t } = useTranslation('automations');
  const id = useId();
  const [recordId, setRecordId] = useState<string>();
  const [assume, setAssume] = useState(false);
  const [body, setBody] = useState(SAMPLE_BODY);
  const [query, setQuery] = useState('');
  const run = useMutation(orpc.automations.test.mutationOptions());
  const request = webhook ? sampleRequest(body, query) : null;

  return (
    <>
      <div className="space-y-2">
        {webhook ? (
          <SampleRequest
            body={body}
            query={query}
            onBody={setBody}
            onQuery={setQuery}
            invalid={!request}
          />
        ) : (
          <>
            <Label htmlFor={`${id}-record`}>
              {type === 'customer' ? t('test-customer', 'Customer') : t('test-company', 'Company')}
            </Label>
            <ContactSelect
              kind={type}
              id={`${id}-record`}
              value={recordId}
              onValueChange={setRecordId}
              noneLabel={t('pick-record', 'Pick one')}
            />
          </>
        )}
        <div className="flex items-center gap-2 text-sm">
          <Switch id={`${id}-assume`} checked={assume} onCheckedChange={setAssume} />
          <Label htmlFor={`${id}-assume`} variant="option">
            {t('assume-event', 'Waits for events: assume the event happens')}
          </Label>
        </div>
        <Button
          disabled={run.isPending || (webhook && !request)}
          onClick={() =>
            run.mutate({
              id: automationId,
              ...(request ? { payload: request } : {}),
              ...(!webhook && recordId ? { subjectType: type, subjectId: recordId } : {}),
              assumeEventHappens: assume,
            })
          }
        >
          {run.isPending ? <Spinner size="sm" /> : t('run-test', 'Run the test')}
        </Button>
      </div>
      {run.isError && <p className="text-sm text-destructive-text">{messageOf(run.error)}</p>}
      {run.data && <TestTrace result={run.data} />}
    </>
  );
};

/**
 * Dry run of the working copy: pick a record (a webhook's: write a sample call), see which way each branch goes
 * and what each action would get. Nothing is changed. (Save first: it tests
 * what is saved.)
 */
export const TestPanel = ({
  automation,
  subject,
}: {
  automation: Pick<Automation, 'id' | 'definition'>;
  subject: 'customer' | 'company' | null;
}) => {
  const { t } = useTranslation('automations');
  const [open, setOpen] = useState(false);
  const webhook = automation.definition.trigger.kind === 'webhook';

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <Sheet.Trigger render={<Button variant="outline" />}>
        <IconFlask />
        {t('test', 'Test')}
      </Sheet.Trigger>
      <Sheet.View size="xl">
        <Sheet.Header>
          <Sheet.Title>{t('test-title', 'Test without changing anything')}</Sheet.Title>
          <Sheet.Description>
            {webhook
              ? t(
                  'test-description-webhook',
                  'Shows what the saved version would do for a sample call. Nothing is sent or changed.',
                )
              : t(
                  'test-description',
                  'Shows what the saved version would do for a record. Nothing is sent or changed.',
                )}
          </Sheet.Description>
          <Sheet.Close />
        </Sheet.Header>
        <Sheet.Content className="min-h-0 overflow-y-auto">
          {open && (
            <TestForm automationId={automation.id} type={subject ?? 'customer'} webhook={webhook} />
          )}
        </Sheet.Content>
      </Sheet.View>
    </Sheet>
  );
};
