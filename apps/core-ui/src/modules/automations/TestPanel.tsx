import type { coreContract } from '@erxes/core-contract';
import type { InferContractRouterOutputs } from '@orpc/contract';
import { IconFlask } from '@tabler/icons-react';
import { skipToken, useMutation, useQuery } from '@tanstack/react-query';
import { Badge, Button, Input, Label, Select, Sheet, Spinner, Switch } from 'erxes-ui';
import { useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { messageOf, orpc } from '~/lib/api';
import { LookupError } from './builder/lookupOptions';

type TestResult = InferContractRouterOutputs<typeof coreContract>['automations']['test'];

/** Up to 20 records of the type matching `search`, as picker options. */
const useTestRecords = (type: 'customer' | 'company', search: string, enabled: boolean) => {
  const input = { limit: 20, search: search || undefined };

  const customers = useQuery(
    orpc.customers.list.queryOptions({
      input: enabled && type === 'customer' ? input : skipToken,
      select: ({ data }) =>
        data.map((row) => ({
          id: row.id,
          label:
            [row.firstName, row.lastName].filter(Boolean).join(' ') || row.primaryEmail || row.id,
        })),
    }),
  );

  const companies = useQuery(
    orpc.companies.list.queryOptions({
      input: enabled && type === 'company' ? input : skipToken,
      select: ({ data }) => data.map((row) => ({ id: row.id, label: row.primaryName ?? row.id })),
    }),
  );

  const query = type === 'customer' ? customers : companies;

  return { records: query.data ?? [], error: query.error };
};

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
        {result.trace.map((item, index) => (
          <li key={`${item.stepId}-${index}`} className="rounded-md border p-2 text-sm">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-muted-foreground">#{item.stepId}</span>
              <span>{item.outcome}</span>
            </div>
            {item.problem && <p className="mt-1 text-xs text-destructive">{item.problem}</p>}
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

/** Pick a record and run the test; mounted while the sheet is open. */
const TestForm = ({
  automationId,
  type,
}: {
  automationId: string;
  type: 'customer' | 'company';
}) => {
  const { t } = useTranslation('automations');
  const id = useId();
  const [search, setSearch] = useState('');
  const [recordId, setRecordId] = useState('');
  const [assume, setAssume] = useState(false);
  const { records, error } = useTestRecords(type, search, true);
  const run = useMutation(orpc.automations.test.mutationOptions());

  return (
    <>
      <div className="space-y-2">
        <Label htmlFor={`${id}-search`}>
          {type === 'customer' ? t('test-customer', 'Customer') : t('test-company', 'Company')}
        </Label>
        <Input
          id={`${id}-search`}
          placeholder={t('search', 'Search…')}
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <Select value={recordId} onValueChange={setRecordId}>
          <Select.Trigger aria-label={t('pick-record', 'Pick one')}>
            <Select.Value placeholder={t('pick-record', 'Pick one')} />
          </Select.Trigger>
          <Select.Content>
            {records.map((record) => (
              <Select.Item key={record.id} value={record.id}>
                {record.label}
              </Select.Item>
            ))}
            <LookupError error={error} />
          </Select.Content>
        </Select>
        <div className="flex items-center gap-2 text-sm">
          <Switch id={`${id}-assume`} checked={assume} onCheckedChange={setAssume} />
          <Label htmlFor={`${id}-assume`} className="font-normal">
            {t('assume-event', 'Waits for events: assume the event happens')}
          </Label>
        </div>
        <Button
          disabled={run.isPending}
          onClick={() =>
            run.mutate({
              id: automationId,
              subject: recordId ? { type, id: recordId } : undefined,
              assumeEventHappens: assume,
            })
          }
        >
          {run.isPending ? <Spinner size="sm" /> : t('run-test', 'Run the test')}
        </Button>
      </div>
      {run.isError && <p className="text-sm text-destructive">{messageOf(run.error)}</p>}
      {run.data && <TestTrace result={run.data} />}
    </>
  );
};

/**
 * Dry run of the working copy: pick a record, see which way each branch goes
 * and what each action would get. Nothing is changed. (Save first: it tests
 * what is saved.)
 */
export const TestPanel = ({
  automationId,
  subject,
}: {
  automationId: string;
  subject: 'customer' | 'company' | null;
}) => {
  const { t } = useTranslation('automations');
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <Sheet.Trigger render={<Button variant="outline" />}>
        <IconFlask />
        {t('test', 'Test')}
      </Sheet.Trigger>
      <Sheet.View className="flex w-full flex-col gap-4 p-4 sm:max-w-xl">
        <Sheet.Header>
          <Sheet.Title>{t('test-title', 'Test without changing anything')}</Sheet.Title>
          <Sheet.Description className="text-sm text-muted-foreground">
            {t(
              'test-description',
              'Shows what the saved version would do for a record. Nothing is sent or changed.',
            )}
          </Sheet.Description>
          <Sheet.Close />
        </Sheet.Header>
        {open && <TestForm automationId={automationId} type={subject ?? 'customer'} />}
      </Sheet.View>
    </Sheet>
  );
};
