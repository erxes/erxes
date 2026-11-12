import type { Automation, AutomationDefinition } from '@erxes/core-contract';
import {
  IconBolt,
  IconCalendarEvent,
  IconClock,
  IconHandFinger,
  IconPlus,
  IconSearch,
  IconTemplate,
} from '@tabler/icons-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Badge,
  Button,
  cn,
  Dialog,
  Empty,
  Input,
  PageContainer,
  ScrollArea,
  Select,
  Spinner,
  Switch,
  useToast,
} from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { PageHeader } from 'erxes-ui';
import { AppBreadcrumb } from '~/components/AppBreadcrumb';
import { api, messageOf } from '~/lib/api';
import { useCan } from '~/modules/auth/session';
import { countSteps, describeTrigger } from './builder/flowModel';

const TRIGGER_ICONS = {
  event: IconBolt,
  schedule: IconClock,
  date: IconCalendarEvent,
  manual: IconHandFinger,
} as const;

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

/** Automations: what each does, whether it's on, how its runs went. */
export const AutomationsListPage = () => {
  const { t } = useTranslation('automations');
  const can = useCan();
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data, isLoading } = useQuery({
    queryKey: ['automations', 'list'],
    queryFn: () => api.automations.list({}),
  });

  const catalog = useQuery({
    queryKey: ['automations', 'catalog'],
    queryFn: () => api.automations.catalog(),
    staleTime: 60_000,
  });

  const [picking, setPicking] = useState(false);

  const templates = useQuery({
    queryKey: ['automations', 'templates'],
    queryFn: () => api.automations.templates(),
    enabled: picking,
  });

  const create = useMutation({
    mutationFn: (from?: { name: string; definition: AutomationDefinition }) =>
      api.automations.create({
        name: from?.name ?? t('untitled', 'Untitled automation'),
        definition: from?.definition ?? STARTER,
      }),
    onSuccess: (automation) => navigate(`/automations/${automation.id}`),
    onError: (error) =>
      toast({
        variant: 'destructive',
        title: t('failed', 'Something went wrong'),
        description: messageOf(error),
      }),
  });

  const client = useQueryClient();
  const [q, setQ] = useState('');
  const [status, setStatus] = useState<'all' | Automation['status']>('all');

  const toggle = useMutation({
    mutationFn: (automation: Automation) =>
      automation.status === 'active'
        ? api.automations.pause({ id: automation.id })
        : api.automations.activate({ id: automation.id }),
    onSuccess: () => void client.invalidateQueries({ queryKey: ['automations'] }),
    onError: (error) =>
      toast({
        variant: 'destructive',
        title: t('toggle-failed', 'Could not turn it on'),
        description: messageOf(error),
      }),
  });

  const triggerLabel = (trigger: AutomationDefinition['trigger']) =>
    describeTrigger(trigger, catalog.data?.triggers ?? [], []).title;

  const shown = (data?.data ?? []).filter(
    (automation) =>
      (status === 'all' || automation.status === status) &&
      (!q.trim() ||
        `${automation.name} ${automation.description ?? ''}`
          .toLowerCase()
          .includes(q.trim().toLowerCase())),
  );

  return (
    <PageContainer>
      <PageHeader>
        <PageHeader.Start>
          <AppBreadcrumb
            items={[{ label: t('title', 'Automations'), to: '/automations', icon: IconBolt }]}
          />
        </PageHeader.Start>
        <PageHeader.End>
          {can('automations.manage') && (
            <>
              <Button
                variant="outline"
                disabled={create.isPending}
                onClick={() => setPicking(true)}
              >
                <IconTemplate />
                {t('from-template', 'From a template')}
              </Button>
              <Button disabled={create.isPending} onClick={() => create.mutate(undefined)}>
                <IconPlus />
                {t('new', 'New automation')}
              </Button>
            </>
          )}
          <Dialog open={picking} onOpenChange={setPicking}>
            <Dialog.Content className="sm:max-w-2xl">
              <Dialog.HeaderCombined
                title={t('templates', 'Start from a template')}
                description={t(
                  'templates-description',
                  'A ready-made automation you can change before turning it on.',
                )}
              />
              {templates.isLoading ? (
                <Spinner />
              ) : (
                <ul className="grid gap-2 sm:grid-cols-2">
                  {templates.data?.data.map((template) => (
                    <li key={template.id}>
                      <button
                        type="button"
                        className="h-full w-full rounded-lg border p-3 text-left hover:bg-muted"
                        onClick={() => {
                          setPicking(false);
                          create.mutate({ name: template.name, definition: template.definition });
                        }}
                      >
                        <p className="flex items-center gap-2 font-medium">
                          {(() => {
                            const Icon = TRIGGER_ICONS[template.definition.trigger.kind];

                            return <Icon className="size-4 text-primary" />;
                          })()}
                          {template.name}
                        </p>
                        <p className="text-sm text-muted-foreground">{template.description}</p>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </Dialog.Content>
          </Dialog>
        </PageHeader.End>
      </PageHeader>
      <ScrollArea className="flex-1">
        <div className="mx-auto max-w-5xl p-6">
          {isLoading ? (
            <Spinner containerClassName="py-12" />
          ) : !data?.data.length ? (
            <Empty className="py-16">
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
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <IconSearch className="absolute top-2 left-2.5 size-4 text-muted-foreground" />
                  <Input
                    className="pl-8"
                    value={q}
                    placeholder={t('search', 'Search automations')}
                    onChange={(event) => setQ(event.target.value)}
                  />
                </div>
                <Select value={status} onValueChange={(value) => setStatus(value as typeof status)}>
                  <Select.Trigger className="w-40">
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
              </div>
              {!shown.length ? (
                <p className="py-10 text-center text-sm text-muted-foreground">
                  {t('no-match', 'Nothing matches.')}
                </p>
              ) : (
                <ul className="divide-y rounded-lg border">
                  {shown.map((automation) => {
                    const Icon = TRIGGER_ICONS[automation.definition.trigger.kind];

                    return (
                      <li
                        key={automation.id}
                        className="flex items-center gap-4 p-4 hover:bg-muted/50"
                      >
                        <span
                          className={cn(
                            'flex size-9 shrink-0 items-center justify-center rounded-lg',
                            automation.status === 'active'
                              ? 'bg-primary/10 text-primary'
                              : 'bg-muted text-muted-foreground',
                          )}
                        >
                          <Icon className="size-4" />
                        </span>
                        <Link to={`/automations/${automation.id}`} className="min-w-0 flex-1">
                          <p className="truncate font-medium">{automation.name}</p>
                          <p className="truncate text-xs text-muted-foreground">
                            {triggerLabel(automation.definition.trigger)} ·{' '}
                            {t('steps-count', {
                              count: countSteps(automation.definition.steps),
                              defaultValue: '{{count}} steps',
                            })}
                          </p>
                        </Link>
                        <span className="hidden text-xs text-muted-foreground sm:inline">
                          {t('stat-running', '{{count}} running', {
                            count: automation.stats.running,
                          })}{' '}
                          ·{' '}
                          {t('stat-done', '{{count}} done', { count: automation.stats.succeeded })}
                          {automation.stats.failed > 0 && (
                            <span className="text-destructive">
                              {' '}
                              ·{' '}
                              {t('stat-failed', '{{count}} failed', {
                                count: automation.stats.failed,
                              })}
                            </span>
                          )}
                        </span>
                        <Badge
                          variant={
                            automation.status === 'active'
                              ? 'success'
                              : automation.status === 'paused'
                                ? 'warning'
                                : 'secondary'
                          }
                        >
                          {t(`automation-status.${automation.status}`, automation.status)}
                        </Badge>
                        {can('automations.manage') && (
                          <Switch
                            checked={automation.status === 'active'}
                            disabled={toggle.isPending}
                            aria-label={
                              automation.status === 'active'
                                ? t('pause', 'Pause')
                                : t('activate', 'Turn on')
                            }
                            onCheckedChange={() => toggle.mutate(automation)}
                          />
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          )}
        </div>
      </ScrollArea>
    </PageContainer>
  );
};
