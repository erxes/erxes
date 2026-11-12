import { IconFlask } from '@tabler/icons-react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Badge, Button, Input, Label, Select, Sheet, Spinner, Switch } from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { api, messageOf } from '~/lib/api';

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
  const [search, setSearch] = useState('');
  const [recordId, setRecordId] = useState<string>('');
  const [assume, setAssume] = useState(false);
  const type = subject ?? 'customer';

  const records = useQuery({
    queryKey: ['automations', 'test-records', type, search],
    queryFn: async () =>
      type === 'customer'
        ? (await api.customers.list({ limit: 20, search: search || undefined })).data.map(
            (row) => ({
              id: row.id,
              label:
                [row.firstName, row.lastName].filter(Boolean).join(' ') ||
                row.primaryEmail ||
                row.id,
            }),
          )
        : (await api.companies.list({ limit: 20, search: search || undefined })).data.map(
            (row) => ({ id: row.id, label: row.primaryName ?? row.id }),
          ),
    enabled: open,
  });

  const run = useMutation({
    mutationFn: () =>
      api.automations.test({
        id: automationId,
        subject: recordId ? { type, id: recordId } : undefined,
        assumeEventHappens: assume,
      }),
  });

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <Sheet.Trigger asChild>
        <Button variant="outline">
          <IconFlask />
          {t('test', 'Test')}
        </Button>
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
        <div className="space-y-2">
          <Label>
            {type === 'customer' ? t('test-customer', 'Customer') : t('test-company', 'Company')}
          </Label>
          <Input
            placeholder={t('search', 'Search…')}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <Select value={recordId} onValueChange={setRecordId}>
            <Select.Trigger>
              <Select.Value placeholder={t('pick-record', 'Pick one')} />
            </Select.Trigger>
            <Select.Content>
              {(records.data ?? []).map((record) => (
                <Select.Item key={record.id} value={record.id}>
                  {record.label}
                </Select.Item>
              ))}
            </Select.Content>
          </Select>
          <label className="flex items-center gap-2 text-sm">
            <Switch checked={assume} onCheckedChange={setAssume} />
            {t('assume-event', 'Waits for events: assume the event happens')}
          </label>
          <Button disabled={run.isPending} onClick={() => run.mutate()}>
            {run.isPending ? <Spinner size="sm" /> : t('run-test', 'Run the test')}
          </Button>
        </div>
        {run.isError && <p className="text-sm text-destructive">{messageOf(run.error)}</p>}
        {run.data && (
          <div className="min-h-0 flex-1 space-y-2 overflow-auto">
            <div className="flex gap-2">
              <Badge variant={run.data.triggerMatches ? 'success' : 'warning'}>
                {run.data.triggerMatches
                  ? t('trigger-matches', 'The trigger’s conditions hold')
                  : t('trigger-not', 'The trigger’s conditions don’t hold')}
              </Badge>
              {run.data.goalMetAtStart && (
                <Badge variant="info">{t('goal-already', 'Goal already met')}</Badge>
              )}
            </div>
            <ol className="space-y-2">
              {run.data.trace.map((item, index) => (
                <li key={`${item.stepId}-${index}`} className="rounded-md border p-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-muted-foreground">#{item.stepId}</span>
                    <span>{item.outcome}</span>
                  </div>
                  {item.problem && <p className="mt-1 text-xs text-destructive">{item.problem}</p>}
                  {item.input !== null && item.input !== undefined && (
                    <pre className="mt-1 max-h-40 overflow-auto rounded bg-muted p-2 text-[11px]">
                      {JSON.stringify(item.input, null, 2)}
                    </pre>
                  )}
                </li>
              ))}
            </ol>
          </div>
        )}
      </Sheet.View>
    </Sheet>
  );
};
