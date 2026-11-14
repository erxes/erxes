import { paths } from '~/lib/paths';
import { type Automation, type AutomationDefinition, AutomationStatus } from '@erxes/core-contract';
import { IconBolt, IconPlus, IconSearch, IconTemplate } from '@tabler/icons-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Badge,
  Button,
  cn,
  Empty,
  InputGroup,
  PageContainer,
  PageHeader,
  ScrollArea,
  Select,
  Switch,
  useToast,
} from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { AppBreadcrumb } from '~/components/AppBreadcrumb';
import { QueryState } from '~/components/QueryState';
import { messageOf, orpc } from '@erxes/core-contract/client';
import { useCan } from '~/modules/auth/session';
import { catalogQuery } from './automationQueries';
import { countSteps } from './builder/flowChecks';
import { describeTrigger } from './builder/flowText';
import { TemplatePicker, TriggerIcon } from './TemplatePicker';

const STARTER: AutomationDefinition = {
  trigger: { kind: 'event', event: 'core.customer.created' },
  steps: [
    {
      id: 'note',
      type: 'action',
      action: 'core.note.add',
      input: { body: 'Welcome {{subject.firstName}}!' },
    },
  ],
  reentry: 'always',
};

const STATUS_BADGE = { active: 'success', paused: 'warning', draft: 'secondary' } as const;

/** On and off from the list: pause an active automation, turn the others on. */
const useToggle = () => {
  const { t } = useTranslation('automations');
  const { toast } = useToast();
  const client = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: Pick<Automation, 'id' | 'status'>) =>
      status === 'active'
        ? orpc.automations.pause.call({ id })
        : orpc.automations.activate.call({ id }),
    onSuccess: () => client.invalidateQueries({ queryKey: orpc.automations.key() }),
    onError: (error) =>
      toast({
        variant: 'destructive',
        title: t('toggle-failed', 'Could not turn it on'),
        description: messageOf(error),
      }),
  });
};

const AutomationRow = ({
  automation,
  triggerLabel,
  toggle,
}: {
  automation: Automation;
  triggerLabel: string;
  toggle: ReturnType<typeof useToggle> | null;
}) => {
  const { t } = useTranslation('automations');
  const active = automation.status === 'active';

  return (
    <li className="flex items-center gap-4 p-4 hover:bg-muted/50">
      <span
        className={cn(
          'flex size-9 shrink-0 items-center justify-center rounded-lg',
          active ? 'bg-primary/10 text-primary-text' : 'bg-muted text-muted-foreground',
        )}
      >
        <TriggerIcon kind={automation.definition.trigger.kind} className="size-4" />
      </span>
      <Link to={paths.automations.automation(automation.id)} className="min-w-0 flex-1">
        <p className="truncate font-medium">{automation.name}</p>
        <p className="truncate text-xs text-muted-foreground">
          {triggerLabel} ·{' '}
          {t('steps-count', {
            count: countSteps(automation.definition.steps),
            defaultValue: '{{count}} steps',
          })}
        </p>
      </Link>
      <span className="hidden text-xs text-muted-foreground sm:inline">
        {t('stat-running', '{{count}} running', { count: automation.stats.running })} ·{' '}
        {t('stat-done', '{{count}} done', { count: automation.stats.succeeded })}
        {automation.stats.failed > 0 && (
          <span className="text-destructive">
            {' '}
            · {t('stat-failed', '{{count}} failed', { count: automation.stats.failed })}
          </span>
        )}
      </span>
      <Badge variant={STATUS_BADGE[automation.status]}>
        {t(`automation-status.${automation.status}`, { defaultValue: automation.status })}
      </Badge>
      {toggle && (
        <Switch
          checked={active}
          disabled={toggle.isPending}
          aria-label={active ? t('pause', 'Pause') : t('activate', 'Turn on')}
          onCheckedChange={() => toggle.mutate(automation)}
        />
      )}
    </li>
  );
};

const StatusSelect = ({
  value,
  onChange,
}: {
  value: Automation['status'] | 'all';
  onChange: (status: Automation['status'] | 'all') => void;
}) => {
  const { t } = useTranslation('automations');

  return (
    <Select
      value={value}
      onValueChange={(next) =>
        onChange(AutomationStatus.options.find((option) => option === next) ?? 'all')
      }
    >
      <Select.Trigger className="w-40" aria-label={t('status', 'Status')}>
        <Select.Value />
      </Select.Trigger>
      <Select.Content>
        <Select.Item value="all">{t('status-all', 'All')}</Select.Item>
        {(['active', 'paused', 'draft'] as const).map((item) => (
          <Select.Item key={item} value={item}>
            {t(`automation-status.${item}`, item)}
          </Select.Item>
        ))}
      </Select.Content>
    </Select>
  );
};

/** Search and status filter over the automations, each with its on/off switch. */
const AutomationList = ({ automations }: { automations: Automation[] }) => {
  const { t } = useTranslation('automations');
  const canManage = useCan()('automations.manage');
  const toggle = useToggle();
  const catalog = useQuery(catalogQuery());
  const [q, setQ] = useState('');
  const [status, setStatus] = useState<Automation['status'] | 'all'>('all');
  const search = q.trim().toLowerCase();

  const shown = automations.filter(
    (automation) =>
      (status === 'all' || automation.status === status) &&
      (!search ||
        `${automation.name} ${automation.description ?? ''}`.toLowerCase().includes(search)),
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <InputGroup className="flex-1">
          <InputGroup.Addon>
            <IconSearch className="size-4" />
          </InputGroup.Addon>
          <InputGroup.Input
            value={q}
            placeholder={t('search', 'Search automations')}
            aria-label={t('search', 'Search automations')}
            onChange={(event) => setQ(event.target.value)}
          />
        </InputGroup>
        <StatusSelect value={status} onChange={setStatus} />
      </div>
      {catalog.error && <p className="text-sm text-destructive">{messageOf(catalog.error)}</p>}
      {!shown.length ? (
        <Empty>
          <Empty.Description>{t('no-match', 'Nothing matches.')}</Empty.Description>
        </Empty>
      ) : (
        <ul className="divide-y rounded-lg border">
          {shown.map((automation) => (
            <AutomationRow
              key={automation.id}
              automation={automation}
              triggerLabel={
                describeTrigger(automation.definition.trigger, catalog.data?.triggers ?? [], [])
                  .title
              }
              toggle={canManage ? toggle : null}
            />
          ))}
        </ul>
      )}
    </div>
  );
};

const NoAutomations = () => {
  const { t } = useTranslation('automations');

  return (
    <Empty>
      <Empty.Header>
        <Empty.Media variant="icon">
          <IconBolt />
        </Empty.Media>
        <Empty.Title>{t('empty', 'No automations yet')}</Empty.Title>
        <Empty.Description>
          {t(
            'empty-description',
            'When something happens — a customer is created, a plugin event fires — do the busywork for you.',
          )}
        </Empty.Description>
      </Empty.Header>
    </Empty>
  );
};

/** Automations: what each does, whether it's on, how its runs went. */
export const AutomationsListPage = () => {
  const { t } = useTranslation('automations');
  const canManage = useCan()('automations.manage');
  const navigate = useNavigate();
  const { toast } = useToast();
  const [picking, setPicking] = useState(false);
  const automations = useQuery(orpc.automations.list.queryOptions({ input: {} }));

  const create = useMutation(
    orpc.automations.create.mutationOptions({
      onSuccess: (automation) => navigate(paths.automations.automation(automation.id)),
      onError: (error) =>
        toast({
          variant: 'destructive',
          title: t('failed', 'Something went wrong'),
          description: messageOf(error),
        }),
    }),
  );

  return (
    <PageContainer>
      <PageHeader>
        <PageHeader.Start>
          <AppBreadcrumb
            items={[
              { label: t('title', 'Automations'), to: paths.automations.list, icon: IconBolt },
            ]}
          />
        </PageHeader.Start>
        <PageHeader.End>
          {canManage && (
            <>
              <Button
                variant="outline"
                disabled={create.isPending}
                onClick={() => setPicking(true)}
              >
                <IconTemplate />
                {t('from-template', 'From a template')}
              </Button>
              <Button
                disabled={create.isPending}
                onClick={() =>
                  create.mutate({ name: t('untitled', 'Untitled automation'), definition: STARTER })
                }
              >
                <IconPlus />
                {t('new', 'New automation')}
              </Button>
            </>
          )}
          <TemplatePicker
            open={picking}
            onOpenChange={setPicking}
            onPick={({ name, definition }) => {
              setPicking(false);
              create.mutate({ name, definition });
            }}
          />
        </PageHeader.End>
      </PageHeader>
      <ScrollArea className="flex-1">
        <div className="mx-auto max-w-5xl p-6">
          <QueryState
            query={automations}
            className="py-12"
            isEmpty={({ data }) => !data.length}
            empty={<NoAutomations />}
          >
            {({ data }) => <AutomationList automations={data} />}
          </QueryState>
        </div>
      </ScrollArea>
    </PageContainer>
  );
};
