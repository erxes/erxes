import type { AutomationDefinition } from '@erxes/core-contract';
import { IconBolt, IconPlus } from '@tabler/icons-react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Badge, Button, Empty, PageContainer, ScrollArea, Spinner, useToast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { PageHeader } from 'ui-modules';
import { AppBreadcrumb } from '~/components/AppBreadcrumb';
import { api, messageOf } from '~/lib/api';
import { useCan } from '~/modules/auth/session';

const STARTER: AutomationDefinition = {
  trigger: { event: 'core.customer.created' },
  steps: [{ id: 'note', type: 'action', action: 'core.note.add', input: { body: 'Welcome {{subject.firstName}}!' } }],
  reentry: 'always',
};

/** Automations: what each does, whether it's on, how its runs went. */
export const AutomationsListPage = () => {
  const { t } = useTranslation('automations');
  const can = useCan();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data, isLoading } = useQuery({ queryKey: ['automations', 'list'], queryFn: () => api.automations.list({}) });
  const catalog = useQuery({ queryKey: ['automations', 'catalog'], queryFn: () => api.automations.catalog(), staleTime: 60_000 });
  const create = useMutation({
    mutationFn: () => api.automations.create({ name: t('untitled', 'Untitled automation'), definition: STARTER }),
    onSuccess: (automation) => navigate(`/automations/${automation.id}`),
    onError: (error) => toast({ variant: 'destructive', title: t('failed', 'Something went wrong'), description: messageOf(error) }),
  });
  const triggerLabel = (type: string) => catalog.data?.triggers.find((trigger) => trigger.type === type)?.label ?? type;

  return (
    <PageContainer>
      <PageHeader>
        <PageHeader.Start>
          <AppBreadcrumb items={[{ label: t('title', 'Automations'), to: '/automations', icon: IconBolt }]} />
        </PageHeader.Start>
        <PageHeader.End>
          {can('automations.manage') && (
            <Button disabled={create.isPending} onClick={() => create.mutate()}>
              <IconPlus />
              {t('new', 'New automation')}
            </Button>
          )}
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
                  {t('empty-description', 'When something happens — a customer is created, a plugin event fires — do the busywork for you.')}
                </Empty.Description>
              </Empty.Header>
            </Empty>
          ) : (
            <ul className="divide-y rounded-lg border">
              {data.data.map((automation) => (
                <li key={automation.id}>
                  <Link to={`/automations/${automation.id}`} className="flex items-center gap-4 p-4 hover:bg-muted/50">
                    <IconBolt className={automation.status === 'active' ? 'size-5 text-primary' : 'size-5 text-muted-foreground'} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{automation.name}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {t('when', 'When')}: {triggerLabel(automation.definition.trigger.event)} ·{' '}
                        {t('steps-count', '{{count}} steps', { count: automation.definition.steps.length })}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {t('stats', '{{running}} running · {{succeeded}} done · {{failed}} failed', automation.stats)}
                    </span>
                    <Badge variant={automation.status === 'active' ? 'success' : automation.status === 'paused' ? 'warning' : 'secondary'}>
                      {t(`automation-status.${automation.status}`, automation.status)}
                    </Badge>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </ScrollArea>
    </PageContainer>
  );
};
